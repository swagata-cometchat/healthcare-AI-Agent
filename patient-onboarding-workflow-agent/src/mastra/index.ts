import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { patientOnboardingAgent, workflowManager } from './agents/onboarding-agent';
import { apiRoutes } from './server/routes';

export const mastra = new Mastra({
  agents: { 
    'patient-onboarding': patientOnboardingAgent,
    'workflow-manager': workflowManager
  },
  logger: new PinoLogger({ name: 'PatientOnboarding-Mastra', level: 'info' }),
  server: {
    build: { swaggerUI: true },
    apiRoutes,
  },
});