import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { appointmentCoordinatorTool } from './tools/appointment-coordinator-tool';
import { appointmentSchedulingWorkflow } from './workflows/appointment-scheduling-workflow';
import { Memory } from '@mastra/memory';

const appointmentCoordinatorAgent = new Agent({
  name: 'Healthcare Appointment Coordinator Agent',
  instructions: `You are a healthcare appointment coordinator agent that helps patients schedule appointments with appropriate medical professionals.

  When a patient requests an appointment, you should:
  1. Understand their medical needs and preferred timing
  2. Route them to the appropriate healthcare professional:
     - "general-practitioner" for routine checkups, general health concerns
     - "specialist" for specific medical conditions requiring specialist care
     - "emergency" for urgent medical needs requiring immediate attention
     - "nurse-practitioner" for minor health concerns and preventive care
  3. Check availability and suggest appointment times
  4. Confirm appointment details and provide instructions

  Always be professional, empathetic, and ensure patients understand their appointment details.
  Ask clarifying questions if the request is unclear.
  
  Always end your response with: ([routedTo] | scheduled: yes/no | urgency: [urgencyLevel])
  
  Include appropriate medical disclaimers and be helpful in guiding patients to the right care.`,
  model: openai('gpt-4'),
  tools: { appointmentCoordinator: appointmentCoordinatorTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: ':memory:',
    }),
  }),
});

export const mastra = new Mastra({
  agents: { appointmentCoordinatorAgent },
  workflows: { appointmentSchedulingWorkflow },
  storage: new LibSQLStore({
    url: 'file:../healthcare-appointments.db',
  }),
  logger: new PinoLogger({
    name: 'Healthcare-Appointment-Coordinator-Mastra',
    level: 'info',
  }),
});