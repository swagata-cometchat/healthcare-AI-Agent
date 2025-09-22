import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

export const doctorAgent = new Agent({
  name: 'Doctor',
  instructions: `You are a licensed medical doctor with expertise in diagnosing and treating various medical conditions.
  Provide detailed medical assessments for symptoms that require professional medical attention.
  Offer treatment recommendations, diagnostic suggestions, and follow-up care instructions.
  If symptoms are life-threatening or require immediate care, recommend emergency medical attention.
  Always maintain professional medical standards and include appropriate disclaimers.`,
  model: openai('gpt-4'),
});

// For compatibility with the symptom checker
export const doctorAgentWithAnswer = {
  ...doctorAgent,
  answer: async (symptoms: string) => {
    const response = await doctorAgent.stream([
      { role: 'user', content: `Please provide a medical assessment for these symptoms: ${symptoms}` },
    ]);
    let output = '';
    for await (const chunk of response.textStream) {
      output += chunk;
    }
    return output;
  },
};