import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { SymptomCheckerAgent, SymptomCheckResult } from '../agents/symptom-checker-agent';

const internalSymptomChecker = new SymptomCheckerAgent();

export const symptomCheckerTool = createTool({
  id: 'symptom-checker',
  description: 'Assess symptoms and route to appropriate medical professional based on severity.',
  inputSchema: z.object({
    symptoms: z.string().min(3).describe('Description of symptoms'),
  }),
  outputSchema: z.object({
    assessment: z.string(),
    routedTo: z.enum(['nurse', 'doctor', 'emergency', 'human']),
    escalated: z.boolean(),
  }),
  execute: async ({ context }) => {
    const { symptoms } = context as { symptoms: string };
    const result: SymptomCheckResult = await internalSymptomChecker.checkSymptoms(symptoms);
    return {
      assessment: result.assessment,
      routedTo: result.routedTo,
      escalated: result.escalated,
    };
  },
});