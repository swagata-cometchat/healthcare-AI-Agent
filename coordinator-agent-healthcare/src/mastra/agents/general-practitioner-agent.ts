import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

export interface SchedulingResult {
  message: string;
  scheduled: boolean;
  appointmentDetails?: {
    date: string;
    time: string;
    provider: string;
    location: string;
    appointmentId: string;
  };
  nextSteps: string[];
}

export const generalPractitionerAgentBase = new Agent({
  name: 'General Practitioner Scheduler',
  instructions: `You are a scheduling assistant for general practitioners. Help patients schedule routine medical appointments.
  Always provide realistic appointment times and be helpful with scheduling options.
  Include appointment confirmation details when scheduling is successful.`,
  model: openai('gpt-4'),
});

// Enhanced scheduling methods
export const generalPractitionerAgentWithScheduling = {
  scheduleAppointment: async (request: string, preferredDate?: string, preferredTime?: string): Promise<SchedulingResult> => {
    // Simulate scheduling logic
    const appointmentId = `GP-${Date.now()}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const scheduledDate = preferredDate || tomorrow.toISOString().split('T')[0];
    const scheduledTime = preferredTime || '10:00 AM';
    
    return {
      message: `Great! I've scheduled your appointment with Dr. Sarah Johnson, General Practitioner. Your appointment is confirmed for ${scheduledDate} at ${scheduledTime}. Please arrive 15 minutes early and bring your insurance card and ID.`,
      scheduled: true,
      appointmentDetails: {
        date: scheduledDate,
        time: scheduledTime,
        provider: 'Dr. Sarah Johnson, MD',
        location: 'Main Medical Center, Room 201',
        appointmentId: appointmentId
      },
      nextSteps: [
        'Arrive 15 minutes early for check-in',
        'Bring insurance card and photo ID',
        'Prepare list of current medications',
        'Write down any questions or concerns'
      ]
    };
  }
};