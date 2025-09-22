import { SchedulingResult } from './general-practitioner-agent';

export const emergencySchedulerAgent = {
  name: 'Emergency Scheduler',
  scheduleEmergency: async (request: string): Promise<SchedulingResult> => {
    const appointmentId = `EMRG-${Date.now()}`;
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = now.toISOString().split('T')[0];
    
    return {
      message: `🚨 URGENT: This appears to be an emergency situation. I'm prioritizing your request immediately. You should proceed directly to the Emergency Department or call 911 if this is life-threatening. I've also flagged you for the next available urgent care slot.`,
      scheduled: true,
      appointmentDetails: {
        date: today,
        time: 'IMMEDIATE',
        provider: 'Emergency Department / Urgent Care',
        location: 'Emergency Department - Main Hospital',
        appointmentId: appointmentId
      },
      nextSteps: [
        '🚨 If life-threatening, call 911 immediately',
        'Go directly to Emergency Department',
        'Bring insurance card and photo ID if possible',
        'Have someone drive you - do not drive yourself',
        'Call ahead to alert them of your arrival: (555) 123-EMRG'
      ]
    };
  }
};