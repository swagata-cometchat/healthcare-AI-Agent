import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { SchedulingResult } from './general-practitioner-agent';

export const specialistAgentBase = new Agent({
  name: 'Specialist Scheduler',
  instructions: `You are a scheduling assistant for medical specialists (cardiologists, dermatologists, etc.). 
  Help patients schedule specialized medical appointments. Consider that specialist appointments may have longer wait times.
  Always provide realistic scheduling and include referral requirements if needed.`,
  model: openai('gpt-4'),
});

export const specialistAgentWithScheduling = {
  scheduleAppointment: async (request: string, preferredDate?: string, preferredTime?: string): Promise<SchedulingResult> => {
    const appointmentId = `SPEC-${Date.now()}`;
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const scheduledDate = preferredDate || nextWeek.toISOString().split('T')[0];
    const scheduledTime = preferredTime || '2:00 PM';
    
    // Determine specialist type based on request
    const lower = request.toLowerCase();
    let specialistType = 'Specialist';
    let location = 'Specialty Care Center';
    
    if (lower.includes('heart') || lower.includes('cardio')) {
      specialistType = 'Dr. Michael Chen, Cardiologist';
      location = 'Cardiology Department, 3rd Floor';
    } else if (lower.includes('skin') || lower.includes('dermat')) {
      specialistType = 'Dr. Lisa Rodriguez, Dermatologist';
      location = 'Dermatology Clinic, 2nd Floor';
    } else if (lower.includes('bone') || lower.includes('orthopedic')) {
      specialistType = 'Dr. James Wilson, Orthopedic Surgeon';
      location = 'Orthopedic Center, 4th Floor';
    }
    
    return {
      message: `I've scheduled your specialist appointment with ${specialistType}. Your appointment is confirmed for ${scheduledDate} at ${scheduledTime}. Please note that you may need a referral from your primary care physician.`,
      scheduled: true,
      appointmentDetails: {
        date: scheduledDate,
        time: scheduledTime,
        provider: specialistType,
        location: location,
        appointmentId: appointmentId
      },
      nextSteps: [
        'Obtain referral from primary care physician if required',
        'Bring insurance card and photo ID',
        'Bring relevant medical records or test results',
        'Arrive 20 minutes early for specialist check-in',
        'Prepare detailed medical history and symptom list'
      ]
    };
  }
};