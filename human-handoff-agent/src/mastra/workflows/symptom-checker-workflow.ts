import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { SymptomCheckerAgent, SymptomCheckResult } from '../agents/symptom-checker-agent';

const internalSymptomChecker = new SymptomCheckerAgent();

const assessSymptoms = createStep({
  id: 'assess-symptoms',
  description: 'Assess patient symptoms and route to appropriate medical professional or escalate to human.',
  inputSchema: z.object({
    symptoms: z.string().min(3).describe('Patient symptoms description'),
    patientAge: z.number().optional().describe('Patient age for better assessment'),
  }),
  outputSchema: z.object({
    assessment: z.string(),
    routedTo: z.enum(['nurse', 'doctor', 'emergency', 'human']),
    escalated: z.boolean(),
    escalationLevel: z.enum(['doctor', 'emergency', 'human']).optional(),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
    recommendedAction: z.string(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error('Missing input');
    const result: SymptomCheckResult = await internalSymptomChecker.checkSymptoms(inputData.symptoms);
    return {
      assessment: result.assessment,
      routedTo: result.routedTo,
      escalated: result.escalated,
      escalationLevel: result.escalationLevel,
      urgencyLevel: result.urgencyLevel,
      recommendedAction: result.recommendedAction,
    };
  },
});

export const symptomCheckerWorkflow = createWorkflow({
  id: 'symptom-checker-workflow',
  inputSchema: z.object({
    symptoms: z.string().min(3),
    patientAge: z.number().optional(),
  }),
  outputSchema: z.object({
    assessment: z.string(),
    routedTo: z.enum(['nurse', 'doctor', 'emergency', 'human']),
    escalated: z.boolean(),
    escalationLevel: z.enum(['doctor', 'emergency', 'human']).optional(),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
    recommendedAction: z.string(),
  }),
})
  .then(assessSymptoms)
  .commit();