import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- constants ---
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const NAMESPACE_REGEX = /^[a-zA-Z0-9._-]+$/;
const STOPWORDS = new Set([
  "the","a","an","and","or","of","to","in","on","for","by","with","at","as",
  "is","are","was","were","be","being","been","from","that","this","these","those",
  "it","its","into","about","over","under","up","down"
]);

// --- helpers ---
async function dirExists(p: string): Promise<boolean> {
  try { return (await fs.stat(p)).isDirectory(); } catch { return false; }
}

async function resolveKnowledgeDir(namespace: string): Promise<string> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const cwd = process.cwd();
  const candidates = [
    path.resolve(here, "../../../knowledge", namespace),
    path.resolve(here, "../../../../knowledge", namespace),
    path.resolve(cwd, "knowledge", namespace),
    path.resolve(cwd, "..", "knowledge", namespace),
    path.resolve("knowledge", namespace),
  ];
  for (const p of candidates) if (await dirExists(p)) return p;
  return candidates[0];
}

function extractTokens(q: string): { phrases: string[]; words: string[] } {
  const phrases: string[] = [];
  let rest = q;

  // extract "quoted phrases"
  const quoteRe = /"([^"]{2,})"/g;
  let m: RegExpExecArray | null;
  while ((m = quoteRe.exec(q))) {
    phrases.push(m[1].toLowerCase().trim());
  }
  rest = q.replace(quoteRe, " ");

  // remaining words (>=2 chars, not stopwords)
  const words = rest
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOPWORDS.has(w));

  return { phrases, words };
}

function countOccurrences(hay: string, needle: string): { count: number; first: number } {
  let count = 0;
  let first = -1;
  let pos = 0;
  while (true) {
    const i = hay.indexOf(needle, pos);
    if (i === -1) break;
    if (first === -1) first = i;
    count++;
    pos = i + Math.max(needle.length, 1);
  }
  return { count, first };
}

export const docsRetriever = createTool({
  id: "docsRetriever",
  description: "Search knowledge/<namespace> for relevant medical information and patient FAQ content.",
  inputSchema: z.object({
    query: z.string().min(2),
    maxResults: z.number().int().min(1).max(50).default(6),
    namespace: z.string().default("medical"),
  }),

  execute: async (raw: any) => {
    // accept {context:{…}} OR {input:{…}} OR flat
    const base =
      (raw && typeof raw === "object" && "context" in raw && (raw as any).context) ??
      (raw && typeof raw === "object" && "input" in raw && (raw as any).input) ??
      raw ?? {};

    const query = (base?.query ?? "").toString().trim();
    const maxResults = typeof base?.maxResults === "number" ? base.maxResults : 6;
    const namespace = (base?.namespace ?? "medical").toString().trim();

    if (!query) return { results: [], error: "Missing required 'query'." };
    if (!namespace) return { results: [], error: "Missing required 'namespace'." };
    if (!NAMESPACE_REGEX.test(namespace)) {
      return { results: [], error: `Invalid namespace '${namespace}'. Allowed pattern: ${NAMESPACE_REGEX}` };
    }

    const root = await resolveKnowledgeDir(namespace);
    if (!(await dirExists(root))) {
      return { results: [], error: `Medical knowledge namespace '${namespace}' not found at ${root}.` };
    }

    let entries: string[] = [];
    try {
      entries = await fs.readdir(root);
    } catch (e: any) {
      return { results: [], error: `Failed to read medical knowledge directory: ${e?.message || "unknown error"}` };
    }

    const files = entries.filter(f => /\.(md|mdx|txt)$/i.test(f));
    if (files.length === 0) {
      return { results: [], error: `No medical FAQ files found in '${namespace}' namespace.` };
    }

    const { phrases, words } = extractTokens(query);
    const tokens = [...phrases, ...words];
    if (tokens.length === 0) {
      return { results: [], sources: [], info: "No searchable medical terms in query." };
    }

    type Hit = {
      file: string;
      excerpt: string;
      firstIndex: number;
      tokenMatches: number;
      occurrences: number;
      score: number;
    };

    const hitPromises = files.map(async (f): Promise<Hit | null> => {
      const full = path.join(root, f);
      try {
        const stat = await fs.stat(full);
        if (stat.size > MAX_FILE_SIZE) return null;

        const content = await fs.readFile(full, "utf8");
        const lower = content.toLowerCase();

        let totalOcc = 0;
        let tokenMatches = 0;
        let earliest = Number.POSITIVE_INFINITY;

        // content matches
        for (const t of tokens) {
          const { count, first } = countOccurrences(lower, t);
          if (count > 0) {
            tokenMatches++;
            totalOcc += count;
            if (first !== -1 && first < earliest) earliest = first;
          }
        }

        // filename bonus for medical terms
        const fname = f.toLowerCase();
        let filenameBonus = 0;
        for (const t of tokens) {
          if (fname.includes(t)) filenameBonus += 5;
        }

        if (tokenMatches === 0 && filenameBonus === 0) return null;

        // excerpt around earliest match (or start)
        const idx = isFinite(earliest) ? earliest : 0;
        const window = 180;
        const start = Math.max(0, idx - window);
        const end = Math.min(content.length, idx + window);
        const excerpt = content.slice(start, end).replace(/\s+/g, " ").trim();

        // score: cover more tokens > more occurrences > earlier position + filename bonus
        const coverage = tokenMatches / tokens.length; // 0..1
        const early = isFinite(earliest) ? 1 - earliest / Math.max(content.length, 1) : 0.2;
        const score = coverage * 60 + totalOcc * 6 + early * 10 + filenameBonus;

        return { file: f, excerpt, firstIndex: idx, tokenMatches, occurrences: totalOcc, score };
      } catch {
        return null;
      }
    });

    const allHits = (await Promise.all(hitPromises)).filter((h): h is Hit => !!h);
    if (allHits.length === 0) {
      return { results: [], sources: [], info: "No matching medical information found." };
    }

    allHits.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.firstIndex !== b.firstIndex) return a.firstIndex - b.firstIndex;
      return a.file.localeCompare(b.file);
    });

    const results = allHits.slice(0, maxResults).map(h => ({
      file: h.file,
      excerpt: h.excerpt,
      matchIndex: h.firstIndex,
      occurrences: h.occurrences,
      tokenMatches: h.tokenMatches,
      score: Number(h.score.toFixed(3)),
    }));

    return { results, sources: results.map(r => r.file), query, namespace };
  },
});