import { generalPractitionerAgentWithScheduling } from './general-practitioner-agent';
import { specialistAgentWithScheduling } from './specialist-agent';
import { nursePractitionerAgentWithScheduling } from './nurse-practitioner-agent';
import { emergencySchedulerAgent } from './emergency-scheduler-agent';

export interface AppointmentResult {
  message: string;
  routedTo: 'general-practitioner' | 'specialist' | 'nurse-practitioner' | 'emergency';
  scheduled: boolean;
  appointmentDetails?: {
    date: string;
    time: string;
    provider: string;
    location: string;
    appointmentId: string;
  };
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  nextSteps: string[];
}

export class AppointmentCoordinatorAgent {
  async scheduleAppointment(request: string, preferredDate?: string, preferredTime?: string): Promise<AppointmentResult> {
    const lower = request.toLowerCase();
    
    // Emergency keywords - immediate attention needed
    const emergencyKeywords = [
      'urgent', 'emergency', 'severe pain', 'chest pain', 'difficulty breathing',
      'bleeding', 'accident', 'immediate', 'asap', 'today', 'right now'
    ];
    
    // Specialist keywords - specialized care needed
    const specialistKeywords = [
      'cardiologist', 'dermatologist', 'orthopedic', 'neurologist', 'oncologist',
      'psychiatrist', 'specialist', 'specific condition', 'referred', 'surgery'
    ];

    // Nurse practitioner keywords - minor care
    const nursePractitionerKeywords = [
      'vaccination', 'flu shot', 'blood pressure check', 'minor concern',
      'follow-up', 'prescription refill', 'wellness check'
    ];

    // Check for emergency scheduling
    if (emergencyKeywords.some(keyword => lower.includes(keyword))) {
      const result = await emergencySchedulerAgent.scheduleEmergency(request);
      return {
        message: result.message,
        routedTo: 'emergency',
        scheduled: result.scheduled,
        appointmentDetails: result.appointmentDetails,
        urgencyLevel: 'urgent',
        nextSteps: result.nextSteps
      };
    }

    // Check for specialist appointment
    if (specialistKeywords.some(keyword => lower.includes(keyword))) {
      const result = await specialistAgentWithScheduling.scheduleAppointment(request, preferredDate, preferredTime);
      return {
        message: result.message,
        routedTo: 'specialist',
        scheduled: result.scheduled,
        appointmentDetails: result.appointmentDetails,
        urgencyLevel: 'medium',
        nextSteps: result.nextSteps
      };
    }

    // Check for nurse practitioner appointment
    if (nursePractitionerKeywords.some(keyword => lower.includes(keyword))) {
      const result = await nursePractitionerAgentWithScheduling.scheduleAppointment(request, preferredDate, preferredTime);
      return {
        message: result.message,
        routedTo: 'nurse-practitioner',
        scheduled: result.scheduled,
        appointmentDetails: result.appointmentDetails,
        urgencyLevel: 'low',
        nextSteps: result.nextSteps
      };
    }

    // Default to general practitioner for routine care
    const result = await generalPractitionerAgentWithScheduling.scheduleAppointment(request, preferredDate, preferredTime);
    return {
      message: result.message,
      routedTo: 'general-practitioner',
      scheduled: result.scheduled,
      appointmentDetails: result.appointmentDetails,
      urgencyLevel: 'low',
      nextSteps: result.nextSteps
    };
  }
}