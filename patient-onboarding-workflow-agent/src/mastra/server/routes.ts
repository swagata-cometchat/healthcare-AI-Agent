import { 
  initiateOnboardingHandler,
  updatePatientInfoHandler,
  updateInsuranceInfoHandler,
  processDocumentHandler,
  verifyIdentityHandler,
  verifyInsuranceHandler,
  checkComplianceHandler,
  getStatusHandler
} from './routes/onboarding';

const rootRoute = {
  method: 'GET',
  path: '/',
  handler: (c: any) => c.text('Patient Onboarding Workflow Agent - OK'),
};

export const apiRoutes: Array<any> = [
  rootRoute,
  // Onboarding workflow routes
  {
    method: 'POST',
    path: '/api/onboarding/initiate',
    handler: initiateOnboardingHandler,
  },
  {
    method: 'PUT',
    path: '/api/onboarding/:patientId/patient-info',
    handler: updatePatientInfoHandler,
  },
  {
    method: 'PUT',
    path: '/api/onboarding/:patientId/insurance-info',
    handler: updateInsuranceInfoHandler,
  },
  {
    method: 'POST',
    path: '/api/onboarding/:patientId/process-document',
    handler: processDocumentHandler,
  },
  {
    method: 'POST',
    path: '/api/onboarding/:patientId/verify-identity',
    handler: verifyIdentityHandler,
  },
  {
    method: 'POST',
    path: '/api/onboarding/:patientId/verify-insurance',
    handler: verifyInsuranceHandler,
  },
  {
    method: 'POST',
    path: '/api/onboarding/:patientId/check-compliance',
    handler: checkComplianceHandler,
  },
  {
    method: 'GET',
    path: '/api/onboarding/:patientId/status',
    handler: getStatusHandler,
  },
];