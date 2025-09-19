import { safeErrorMessage } from '../util/safeErrorMessage';
import { PatientOnboardingSchema, WorkflowStatusSchema } from '../../../types/patient';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo (use database in production)
const onboardingRecords = new Map<string, any>();

export const initiateOnboardingHandler = async (c: any) => {
  try {
    const patientId = uuidv4();
    const onboardingRecord = {
      id: patientId,
      status: 'initiated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    onboardingRecords.set(patientId, onboardingRecord);
    
    return c.json({
      success: true,
      patientId,
      status: 'initiated',
      message: 'Patient onboarding initiated successfully',
      nextSteps: [
        'Collect personal information',
        'Upload KYC documents',
        'Verify identity',
        'Validate insurance coverage'
      ]
    });
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};

export const updatePatientInfoHandler = async (c: any) => {
  try {
    const { patientId } = c.req.param();
    const body = await c.req.json();
    
    if (!onboardingRecords.has(patientId)) {
      return c.json({ error: 'Patient onboarding record not found' }, 404);
    }
    
    // Validate patient info
    const patientInfo = PatientOnboardingSchema.pick({ patientInfo: true }).parse({ patientInfo: body });
    
    const record = onboardingRecords.get(patientId);
    record.patientInfo = patientInfo.patientInfo;
    record.status = 'personal_info_collected';
    record.updatedAt = new Date().toISOString();
    
    onboardingRecords.set(patientId, record);
    
    return c.json({
      success: true,
      patientId,
      status: record.status,
      message: 'Patient information collected successfully',
      nextStep: 'Upload KYC documents'
    });
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 400);
  }
};

export const updateInsuranceInfoHandler = async (c: any) => {
  try {
    const { patientId } = c.req.param();
    const body = await c.req.json();
    
    if (!onboardingRecords.has(patientId)) {
      return c.json({ error: 'Patient onboarding record not found' }, 404);
    }
    
    // Validate insurance info
    const insuranceInfo = PatientOnboardingSchema.pick({ insuranceInfo: true }).parse({ insuranceInfo: body });
    
    const record = onboardingRecords.get(patientId);
    record.insuranceInfo = insuranceInfo.insuranceInfo;
    record.status = 'insurance_info_collected';
    record.updatedAt = new Date().toISOString();
    
    onboardingRecords.set(patientId, record);
    
    return c.json({
      success: true,
      patientId,
      status: record.status,
      message: 'Insurance information collected successfully',
      nextStep: 'Upload KYC documents'
    });
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 400);
  }
};

export const processDocumentHandler = async (c: any) => {
  try {
    const { patientId } = c.req.param();
    const { documentType, documentImage } = await c.req.json();
    
    if (!onboardingRecords.has(patientId)) {
      return c.json({ error: 'Patient onboarding record not found' }, 404);
    }
    
    const toolsModule = await import('../../tools/verification-tools');
    const documentProcessor = toolsModule.documentProcessor;
    
    if (!documentProcessor?.execute) {
      return c.json({ error: 'Document processor not available' }, 500);
    }
    
    const result = await documentProcessor.execute({
      context: { documentType, documentImage, patientId },
      mastra: c.get('mastra'),
      runId: patientId,
      runtimeContext: c.get('runtimeContext')
    }) as any;
    
    if (result && result.success) {
      const record = onboardingRecords.get(patientId);
      record.kycDocuments = record.kycDocuments || [];
      record.kycDocuments.push({
        documentType,
        documentNumber: result.extractedData?.documentNumber || 'N/A',
        extractedData: result.extractedData,
        processed: true,
        timestamp: result.timestamp
      });
      record.status = 'kyc_documents_uploaded';
      record.updatedAt = new Date().toISOString();
      
      onboardingRecords.set(patientId, record);
    }
    
    return c.json(result);
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};

export const verifyIdentityHandler = async (c: any) => {
  try {
    const { patientId } = c.req.param();
    
    if (!onboardingRecords.has(patientId)) {
      return c.json({ error: 'Patient onboarding record not found' }, 404);
    }
    
    const record = onboardingRecords.get(patientId);
    
    if (!record.patientInfo || !record.kycDocuments?.length) {
      return c.json({ 
        error: 'Personal information and KYC documents required before identity verification' 
      }, 400);
    }
    
    const toolsModule = await import('../../tools/verification-tools');
    const identityVerifier = toolsModule.identityVerifier;
    
    if (!identityVerifier?.execute) {
      return c.json({ error: 'Identity verifier not available' }, 500);
    }
    
    const result = await identityVerifier.execute({
      context: {
        patientId,
        personalInfo: record.patientInfo.personalInfo,
        documents: record.kycDocuments.map((doc: any) => ({
          type: doc.documentType,
          number: doc.documentNumber,
          extractedData: doc.extractedData
        }))
      },
      mastra: c.get('mastra'),
      runId: patientId,
      runtimeContext: c.get('runtimeContext')
    }) as any;
    
    if (result && result.success) {
      record.verificationResults = record.verificationResults || {};
      record.verificationResults.identityVerified = result.verified;
      record.verificationResults.identityScore = result.score;
      record.verificationResults.verificationNotes = result.reasons?.join('; ') || 'Identity verification completed';
      record.status = result.verified ? 'identity_verification_completed' : 'verification_failed';
      record.updatedAt = new Date().toISOString();
      
      onboardingRecords.set(patientId, record);
    }
    
    return c.json(result);
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};

export const verifyInsuranceHandler = async (c: any) => {
  try {
    const { patientId } = c.req.param();
    
    if (!onboardingRecords.has(patientId)) {
      return c.json({ error: 'Patient onboarding record not found' }, 404);
    }
    
    const record = onboardingRecords.get(patientId);
    
    if (!record.insuranceInfo?.primaryInsurance) {
      return c.json({ 
        error: 'Insurance information required before verification' 
      }, 400);
    }
    
    const toolsModule = await import('../../tools/verification-tools');
    const insuranceValidator = toolsModule.insuranceValidator;
    
    if (!insuranceValidator?.execute) {
      return c.json({ error: 'Insurance validator not available' }, 500);
    }
    
    const result = await insuranceValidator.execute({
      context: {
        patientId,
        insuranceInfo: record.insuranceInfo.primaryInsurance,
        serviceDate: new Date().toISOString().split('T')[0]
      },
      mastra: c.get('mastra'),
      runId: patientId,
      runtimeContext: c.get('runtimeContext')
    }) as any;
    
    if (result && result.success) {
      record.verificationResults = record.verificationResults || {};
      record.verificationResults.insuranceVerified = result.verified;
      record.verificationResults.insuranceEligible = result.eligible;
      record.status = result.verified ? 'insurance_verification_completed' : 'verification_failed';
      record.updatedAt = new Date().toISOString();
      
      onboardingRecords.set(patientId, record);
    }
    
    return c.json(result);
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};

export const checkComplianceHandler = async (c: any) => {
  try {
    const { patientId } = c.req.param();
    
    if (!onboardingRecords.has(patientId)) {
      return c.json({ error: 'Patient onboarding record not found' }, 404);
    }
    
    const record = onboardingRecords.get(patientId);
    const body = await c.req.json();
    const { hasConsent, hasPrivacyNotice, hasDataAgreement } = body;
    
    const toolsModule = await import('../../tools/verification-tools');
    const complianceChecker = toolsModule.complianceChecker;
    
    if (!complianceChecker?.execute) {
      return c.json({ error: 'Compliance checker not available' }, 500);
    }
    
    const result = await complianceChecker.execute({
      context: {
        patientId,
        onboardingData: {
          hasPatientConsent: hasConsent || false,
          hasPrivacyNotice: hasPrivacyNotice || false,
          hasDataProcessingAgreement: hasDataAgreement || false,
          consentTimestamp: hasConsent ? new Date().toISOString() : undefined
        },
        verificationResults: {
          identityVerified: record.verificationResults?.identityVerified || false,
          insuranceVerified: record.verificationResults?.insuranceVerified || false
        }
      },
      mastra: c.get('mastra'),
      runId: patientId,
      runtimeContext: c.get('runtimeContext')
    }) as any;
    
    if (result && result.success && result.compliant) {
      record.status = 'onboarding_completed';
      record.updatedAt = new Date().toISOString();
      onboardingRecords.set(patientId, record);
    }
    
    return c.json(result);
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};

export const getStatusHandler = async (c: any) => {
  try {
    const { patientId } = c.req.param();
    
    if (!onboardingRecords.has(patientId)) {
      return c.json({ error: 'Patient onboarding record not found' }, 404);
    }
    
    const record = onboardingRecords.get(patientId);
    
    return c.json({
      success: true,
      patientId,
      status: record.status,
      progress: {
        personalInfoCollected: !!record.patientInfo,
        insuranceInfoCollected: !!record.insuranceInfo,
        documentsUploaded: !!record.kycDocuments?.length,
        identityVerified: record.verificationResults?.identityVerified || false,
        insuranceVerified: record.verificationResults?.insuranceVerified || false,
        complianceComplete: record.status === 'onboarding_completed'
      },
      verificationResults: record.verificationResults,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};