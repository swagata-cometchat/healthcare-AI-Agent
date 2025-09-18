import { safeErrorMessage } from '../util/safeErrorMessage';

export const ingestSourcesHandler = async (c: any) => {
  try {
    const body = await c.req.json();
    const {
      sources = [],
      files = [],
      namespace = 'medical',
      allowInsecureTLS = false,
    } = body ?? {};

    if ((sources.length + files.length) === 0) {
      return c.json({ error: 'Provide at least one entry in `sources` or `files`.' }, 400);
    }

    const { ingestSources } = await import('../../tools/ingest-sources');
    
    // Use type assertion to bypass TypeScript strict checks
    const result = await (ingestSources as any).execute({
      context: { sources, files, namespace, allowInsecureTLS },
    } as any);

    return c.json(result);
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};