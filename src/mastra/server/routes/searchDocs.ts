import { safeErrorMessage } from '../util/safeErrorMessage';

export const searchDocsHandler = async (c: any) => {
  try {
    const { query, namespace = 'medical', maxResults = 6 } = await c.req.json();
    if (!query) return c.json({ error: 'query is required' }, 400);

    const { docsRetriever } = await import('../../tools/docs-retriever');
    const res = await docsRetriever.execute({
      input: { query, namespace, maxResults },
    });

    return c.json(res);
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};