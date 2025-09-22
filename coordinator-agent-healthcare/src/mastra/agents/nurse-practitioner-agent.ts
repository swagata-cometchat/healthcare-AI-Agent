import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { SchedulingResult } from './general-practitioner-agent';

export const nursePractitionerAgentBase = new Agent({
  name: 'Nurse Practitioner Scheduler',
  instructions: `You are a scheduling assistant for nurse practitioners. Help patients schedule appointments for 
  minor health concerns, wellness checks, vaccinations, and follow-up care.
  Nurse practitioner appointments are typically more readily available than doctor appointments.`,
  model: openai('gpt-4'),
});

export const nursePractitionerAgentWithScheduling = {
  scheduleAppointment: async (request: string, preferredDate?: string, preferredTime?: string): Promise<SchedulingResult> => {
    const appointmentId = `NP-${Date.now()}`;
    const today = new Date();
    const scheduledDate = preferredDate || today.toISOString().split('T')[0];
    const scheduledTime = preferredTime || '11:00 AM';
    
    return {
      message: `Perfect! I've scheduled your appointment with Maria Santos, Nurse Practitioner. Your appointment is confirmed for ${scheduledDate} at ${scheduledTime}. Nurse practitioners are excellent for wellness checks, minor concerns, and preventive care.`,
      scheduled: true,
      appointmentDetails: {
        date: scheduledDate,
        time: scheduledTime,
        provider: 'Maria Santos, NP',
        location: 'Primary Care Clinic, Room 105',
        appointmentId: appointmentId
      },
      nextSteps: [
        'Arrive 10 minutes early for check-in',
        'Bring insurance card and photo ID',
        'List any current medications or supplements',
        'Prepare questions about your health concerns'
      ]
    };
  }
};