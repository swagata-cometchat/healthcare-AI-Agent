import { z } from 'zod';

// Patient Information Schema
export const PatientInfoSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in XXX-XX-XXXX format'),
    phone: z.string().regex(/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, 'Invalid phone number'),
    email: z.string().email('Invalid email address'),
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().length(2, 'State must be 2 characters'),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    }),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().regex(/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, 'Invalid phone number'),
  }),
});

// Insurance Information Schema
export const InsuranceInfoSchema = z.object({
  primaryInsurance: z.object({
    provider: z.string().min(1, 'Insurance provider is required'),
    policyNumber: z.string().min(1, 'Policy number is required'),
    groupNumber: z.string().optional(),
    subscriberName: z.string().min(1, 'Subscriber name is required'),
    subscriberDOB: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    relationshipToSubscriber: z.enum(['self', 'spouse', 'child', 'other']),
  }),
  secondaryInsurance: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    groupNumber: z.string().optional(),
  }).optional(),
});

// KYC Documentation Schema
export const KYCDocumentSchema = z.object({
  documentType: z.enum(['drivers_license', 'passport', 'state_id', 'insurance_card', 'social_security_card']),
  documentNumber: z.string().min(1, 'Document number is required'),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  issuingState: z.string().length(2, 'State must be 2 characters').optional(),
  documentImage: z.string().optional(), // Base64 encoded image or file path
});

// Workflow Status Schema
export const WorkflowStatusSchema = z.enum([
  'initiated',
  'personal_info_collected',
  'insurance_info_collected',
  'kyc_documents_uploaded',
  'identity_verification_pending',
  'identity_verification_completed',
  'insurance_verification_pending',
  'insurance_verification_completed',
  'medical_history_pending',
  'onboarding_completed',
  'verification_failed',
  'requires_manual_review'
]);

// Patient Onboarding Record Schema
export const PatientOnboardingSchema = z.object({
  id: z.string().uuid(),
  status: WorkflowStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  patientInfo: PatientInfoSchema.optional(),
  insuranceInfo: InsuranceInfoSchema.optional(),
  kycDocuments: z.array(KYCDocumentSchema).optional(),
  verificationResults: z.object({
    identityVerified: z.boolean().optional(),
    insuranceVerified: z.boolean().optional(),
    identityScore: z.number().min(0).max(100).optional(),
    insuranceEligible: z.boolean().optional(),
    verificationNotes: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  assignedAgent: z.string().optional(),
});

// Type exports
export type PatientInfo = z.infer<typeof PatientInfoSchema>;
export type InsuranceInfo = z.infer<typeof InsuranceInfoSchema>;
export type KYCDocument = z.infer<typeof KYCDocumentSchema>;
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
export type PatientOnboarding = z.infer<typeof PatientOnboardingSchema>;

// Verification Response Types
export interface IdentityVerificationResponse {
  verified: boolean;
  score: number;
  reasons?: string[];
  documentValid: boolean;
  addressMatch: boolean;
  nameMatch: boolean;
}

export interface InsuranceVerificationResponse {
  eligible: boolean;
  verified: boolean;
  coverageDetails?: {
    effectiveDate: string;
    expirationDate: string;
    copayAmount?: number;
    deductible?: number;
    coverageType: string;
  };
  errors?: string[];
}