// Remove the problematic import from '@mastra/core/types'
// import type { APIRoute } from '@mastra/core/types';

import { ingestSourcesHandler } from './routes/ingest';
import { searchDocsHandler } from './routes/searchDocs';

const rootRoute = {
  method: 'GET',
  path: '/',
  handler: (c: any) => c.text('Patient FAQ Agent - OK'),
};

// Use a generic type instead of the missing APIRoute type
export const apiRoutes: Array<any> = [
  rootRoute,
  {
    method: 'POST',
    path: '/api/tools/ingestSources',
    handler: ingestSourcesHandler,
  },
  {
    method: 'POST',
    path: '/api/tools/searchDocs',
    handler: searchDocsHandler,
  },
];