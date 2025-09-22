import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { AppointmentCoordinatorAgent, AppointmentResult } from '../agents/appointment-coordinator-agent';

const internalAppointmentCoordinator = new AppointmentCoordinatorAgent();

const scheduleAppointment = createStep({
  id: 'schedule-appointment',
  description: 'Schedule a healthcare appointment with the appropriate medical professional based on patient needs.',
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
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error('Missing input');
    
    const result: AppointmentResult = await internalAppointmentCoordinator.scheduleAppointment(
      inputData.request,
      inputData.preferredDate,
      inputData.preferredTime
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

export const appointmentSchedulingWorkflow = createWorkflow({
  id: 'appointment-scheduling-workflow',
  inputSchema: z.object({
    request: z.string().min(3),
    preferredDate: z.string().optional(),
    preferredTime: z.string().optional(),
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
})
  .then(scheduleAppointment)
  .commit();