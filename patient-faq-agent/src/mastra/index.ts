import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { patientFaqAgent } from './agents/patient-faq-agent';
import { apiRoutes } from './server/routes';

export const mastra = new Mastra({
  agents: { 'patient-faq': patientFaqAgent },
  logger: new PinoLogger({ name: 'PatientFAQ-Mastra', level: 'info' }),
  server: {
    build: { swaggerUI: true },
    apiRoutes,
  },
});