import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { AppointmentCoordinatorAgent, AppointmentResult } from '../agents/appointment-coordinator-agent';

const internalAppointmentCoordinator = new AppointmentCoordinatorAgent();

export const appointmentCoordinatorTool = createTool({
  id: 'appointmentCoordinator',
  description: 'Schedule healthcare appointments with appropriate medical professionals based on patient needs and preferences.',
  inputSchema: z.object({
    request: z.string().min(3).describe('Patient appointment request description'),
    preferredDate: z.string().optional().describe('Preferred appointment date (YYYY-MM-DD format)'),
    preferredTime: z.string().optional().describe('Preferred appointment time (e.g., "2:00 PM")'),
  }),
  outputSchema: z.object({
    message: z.string(),
    routedTo: z.enum(['general-practitioner', 'specialist', 'nurse-practitioner', 'emergency']),
    scheduled: z.boolean(),
    appointmentDetails: z.object({
      date: z.string(),
      time: z.string(),
      provider: z.string(),
      location: z.string(),
      appointmentId: z.string(),
    }).optional(),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'urgent']),
    nextSteps: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { request, preferredDate, preferredTime } = context as { 
      request: string; 
      preferredDate?: string; 
      preferredTime?: string; 
    };
    
    const result: AppointmentResult = await internalAppointmentCoordinator.scheduleAppointment(
      request, 
      preferredDate, 
      preferredTime
    );
    
    return {
      message: result.message,
      routedTo: result.routedTo,
      scheduled: result.scheduled,
      appointmentDetails: result.appointmentDetails,
      urgencyLevel: result.urgencyLevel,
      nextSteps: result.nextSteps,
    };
  },
});