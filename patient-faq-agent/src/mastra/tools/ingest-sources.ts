import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import path from "path";
import * as nodefs from "node:fs";
const fs = nodefs.promises;
import { createReadStream } from "node:fs";

import axios, { AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { fileURLToPath } from "url";

/* ---------------- Proxy support (optional) ---------------- */
let proxyAgent: any = null;
try {
  // @ts-ignore
  const { HttpsProxyAgent } = require("https-proxy-agent");
  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    (process.env as any).https_proxy ||
    (process.env as any).http_proxy;
  if (proxyUrl) proxyAgent = new HttpsProxyAgent(proxyUrl);
} catch { /* optional */ }

/* ---------------- Path helpers ---------------- */
const HERE =
  // @ts-ignore
  (typeof __dirname !== "undefined" && __dirname) ||
  path.dirname(fileURLToPath(import.meta.url));

async function pathExists(p: string) {
  try { await fs.stat(p); return true; } catch { return false; }
}

function hasMastraSegment(p: string) {
  return p.split(path.sep).includes(".mastra");
}

/** Find a REAL repo root: climb until a dir with package.json that is NOT inside .mastra */
async function findRepoRoot(start: string): Promise<string> {
  let cur = start;
  for (let i = 0; i < 12; i++) {
    const pkg = path.join(cur, "package.json");
    if (await pathExists(pkg) && !hasMastraSegment(cur)) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  // If we're inside .mastra, jump up until we exit that segment
  let fallback = start;
  while (hasMastraSegment(fallback)) {
    const parent = path.dirname(fallback);
    if (parent === fallback) break;
    fallback = parent;
  }
  return fallback;
}

let REPO_ROOT_PROMISE: Promise<string> | null = null;
function getRepoRoot(): Promise<string> {
  if (!REPO_ROOT_PROMISE) REPO_ROOT_PROMISE = findRepoRoot(HERE);
  return REPO_ROOT_PROMISE;
}

function looksLikePath(s: string) {
  return /[\\/]/.test(s) || /\.[a-z0-9]{2,5}$/i.test(s);
}

/** Resolve a local path without using realpath for absolutes (trust user input). */
async function resolveLocalPathSmart(p: string): Promise<{ abs: string; tried: string[] }> {
  const tried: string[] = [];

  // Absolute path: trust & stat
  if (path.isAbsolute(p)) {
    tried.push(p);
    try { await fs.stat(p); return { abs: p, tried }; } catch { return { abs: "", tried }; }
  }

  const repoRoot = await getRepoRoot();
  const prefixed = p.startsWith(`knowledge${path.sep}`) || p.startsWith("knowledge/");
  const bases = [
    ...(prefixed ? [repoRoot] : []),
    repoRoot,
    HERE,
    process.cwd(),
    path.resolve(process.cwd(), ".."),
    path.resolve(process.cwd(), "../.."),
    path.resolve(process.cwd(), "../../.."),
    path.resolve(HERE, ".."),
    path.resolve(HERE, "../.."),
    path.resolve(HERE, "../../.."),
  ];

  for (const base of bases) {
    const abs = path.resolve(base, p);
    tried.push(abs);
    try { await fs.stat(abs); return { abs, tried }; } catch {}
  }

  return { abs: "", tried };
}

function slugify(input: string) {
  return input.toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 160);
}

/* ---------------- HTTP helpers ---------------- */
function buildAxiosCfg(allowInsecureTLS: boolean): AxiosRequestConfig {
  const baseAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: !allowInsecureTLS });
  return {
    timeout: 45_000,
    maxContentLength: 200 * 1024 * 1024,
    maxBodyLength: 200 * 1024 * 1024,
    httpsAgent: proxyAgent || baseAgent,
    proxy: proxyAgent ? false : undefined,
    validateStatus: (s) => s >= 200 && s < 400,
    headers: {
      "User-Agent": "Mozilla/5.0 (PatientFAQAgent/1.0; +https://example.test)",
      "Accept-Language": "en",
    },
  };
}

async function getArrayBuffer(url: string, allowInsecureTLS: boolean) {
  const base = buildAxiosCfg(allowInsecureTLS);
  const cfg: AxiosRequestConfig = {
    ...base,
    responseType: "arraybuffer",
    headers: { ...base.headers!, "Accept": "application/pdf,application/octet-stream,text/html;q=0.9,*/*;q=0.8" },
  };
  const res = await axios.get(url, cfg);
  return { buf: Buffer.from(res.data), finalUrl: (res.request?.res?.responseUrl as string) || url };
}

async function getText(url: string, allowInsecureTLS: boolean) {
  const base = buildAxiosCfg(allowInsecureTLS);
  const cfg: AxiosRequestConfig = {
    ...base,
    responseType: "text",
    headers: { ...base.headers!, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
  };
  const res = await axios.get(url, cfg);
  return { html: res.data as string, finalUrl: (res.request?.res?.responseUrl as string) || url };
}

/* ---------------- pdf-parse: safe loader ---------------- */
async function loadPdfParse() {
  try {
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    return mod.default || mod;
  } catch {
    try {
      const mod = await import("pdf-parse");
      return mod.default || mod;
    } catch {
      throw new Error("pdf-parse module not available. Please install it: npm install pdf-parse");
    }
  }
}

/* ---------------- HTML/PDF converters ---------------- */
async function fetchHtmlAsMarkdown(url: string, allowInsecureTLS: boolean): Promise<string> {
  const { html, finalUrl } = await getText(url, allowInsecureTLS);
  const $ = cheerio.load(html);
  ["script","style","nav","aside","footer"].forEach((sel) => $(sel).remove());
  const title = $("title").first().text() || finalUrl;
  const text = $("body").text().replace(/\s+/g, " ").trim();
  return `# ${title}\n\nSource: ${finalUrl}\n\n${text}`;
}

async function fetchPdfAsTextBuffer(buf: Buffer, label: string): Promise<string> {
  const pdf = await loadPdfParse();
  const data = await pdf(buf);
  return `# Medical PDF: ${label}\n\n${data.text}`;
}

async function fetchPdfAsText(url: string, allowInsecureTLS: boolean): Promise<string> {
  const { buf, finalUrl } = await getArrayBuffer(url, allowInsecureTLS);
  return fetchPdfAsTextBuffer(buf, finalUrl);
}

/* ---------------- Stream fallback for large files ---------------- */
function readFileStream(abs: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const rs = createReadStream(abs);
    rs.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    rs.on("error", reject);
    rs.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/* ---------------- Ingest helpers ---------------- */
async function ingestUrl(url: string, root: string, allowInsecureTLS: boolean) {
  const content = url.toLowerCase().includes(".pdf")
    ? await fetchPdfAsText(url, allowInsecureTLS)
    : await fetchHtmlAsMarkdown(url, allowInsecureTLS);

  const fname = slugify(url) + ".md";
  const fpath = path.join(root, fname);
  await fs.writeFile(fpath, content, "utf8");

  return { file: path.relative(process.cwd(), fpath), bytes: Buffer.byteLength(content, "utf8"), kind: "url" as const, source: url };
}

async function ingestLocalFile(filePath: string, root: string) {
  const { abs, tried } = await resolveLocalPathSmart(filePath);
  if (!abs) {
    throw Object.assign(new Error(`medical-file-not-found: ${filePath}`), {
      code: "ENOENT",
      filePath,
      tried,
      cwd: process.cwd(),
      here: HERE,
      repoRoot: await getRepoRoot(),
    });
  }

  let text = "";
  try {
    if (/\.pdf$/i.test(abs)) {
      const buf = await readFileStream(abs);
      text = await fetchPdfAsTextBuffer(buf, abs);
    } else if (/\.(md|mdx|txt|html?)$/i.test(abs)) {
      const raw = await fs.readFile(abs, "utf8");
      if (/\.html?$/i.test(abs)) {
        const $ = cheerio.load(raw);
        ["script","style","nav","aside","footer"].forEach((sel) => $(sel).remove());
        const title = $("title").first().text() || abs;
        const body = $("body").text().replace(/\s+/g, " ").trim();
        text = `# Medical Content: ${title}\n\nSource: ${abs}\n\n${body}`;
      } else {
        text = raw;
      }
    } else {
      const raw = await fs.readFile(abs);
      text = `# Medical File: ${abs}\n\n${raw.toString("utf8")}`;
    }
  } catch (e: any) {
    throw Object.assign(new Error(e?.message || "read-failed"), {
      code: e?.code || "READ_FAIL",
      filePath: abs,
      tried,
      cwd: process.cwd(),
      here: HERE,
    });
  }

  const fname = slugify(path.basename(abs)) + ".md";
  const fpath = path.join(root, fname);
  await fs.writeFile(fpath, text, "utf8");

  return { file: path.relative(process.cwd(), fpath), bytes: Buffer.byteLength(text, "utf8"), kind: "file" as const, source: abs };
}

/* ---------------- Tool ---------------- */
export const ingestSources = createTool({
  id: "ingestSources",
  description: "Download and normalize medical sources (URLs, local files, or raw text) into the knowledge/ directory for patient FAQ use.",
  inputSchema: z.object({
    sources: z.array(z.string()).min(0).default([]),
    files: z.array(z.string()).min(0).default([]),
    namespace: z.string().default("medical"),
    allowInsecureTLS: z.boolean().default(false),
  }).refine(d => (d.sources?.length ?? 0) + (d.files?.length ?? 0) > 0, {
    message: "Provide at least one entry in `sources` or `files`."
  }),
  execute: async ({ context }) => {
    const { sources, files, namespace, allowInsecureTLS } = context;

    const repoRoot = await getRepoRoot();
    const root = path.resolve(repoRoot, "knowledge", namespace);
    await fs.mkdir(root, { recursive: true });

    const written: Array<{ file: string; bytes: number; kind: "url" | "text" | "file"; source: string }> = [];

    // 1) URLs / inline
    for (const s of sources) {
      try {
        if (/^https?:\/\//i.test(s)) {
          written.push(await ingestUrl(s, root, allowInsecureTLS));
        } else {
          const { abs } = await resolveLocalPathSmart(s);
          if (abs) {
            written.push(await ingestLocalFile(abs, root));
          } else if (looksLikePath(s)) {
            written.push({ file: `ERROR: medical-file-not-found @ ${s}`, bytes: 0, kind: "file", source: s });
          } else {
            const digest = Buffer.from(s).toString("base64").slice(0, 16);
            const fname = `medical-text-${digest}.md`;
            const fpath = path.join(root, fname);
            const content = `# Patient FAQ Text\n\n${s}`;
            await fs.writeFile(fpath, content, "utf8");
            written.push({ file: path.relative(process.cwd(), fpath), bytes: Buffer.byteLength(content, "utf8"), kind: "text", source: "inline" });
          }
        }
      } catch (e: any) {
        const statusPart = e?.response?.status ? `HTTP ${e.response.status} ${e.response.statusText || ""}`.trim() : null;
        const codePart = e?.code || e?.errno || null;
        const urlPart = e?.filePath || e?.response?.request?.res?.responseUrl || s;
        const msg = [statusPart, codePart].filter(Boolean).join(" | ") || (e?.message || "unknown-error");
        written.push({ file: `ERROR: ${msg} @ ${urlPart}`, bytes: 0, kind: /^https?:/i.test(s) ? "url" : "file", source: s });
      }
    }

    // 2) Explicit files
    for (const fp of files) {
      try {
        written.push(await ingestLocalFile(fp, root));
      } catch (e: any) {
        const tried = Array.isArray(e?.tried) ? e.tried.join(",") : "(n/a)";
        const cwd = e?.cwd || process.cwd();
        const here = e?.here || HERE;
        const at = e?.filePath || fp;
        const msg = e?.code || e?.message || "unknown-error";
        written.push({
          file: `ERROR: ${msg} @ ${at} | cwd=${cwd} | here=${here} | tried=${tried}`,
          bytes: 0,
          kind: "file",
          source: fp,
        });
      }
    }

    return { written };
  },
});