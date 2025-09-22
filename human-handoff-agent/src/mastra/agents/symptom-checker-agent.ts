import { nursePractitionerAgent } from './nurse-practitioner-agent';
import { doctorAgent, doctorAgentWithAnswer } from './doctor-agent';
import { emergencyAgent } from './emergency-agent';
import { humanRepAgent } from './human-rep-agent';

export interface SymptomCheckResult {
  assessment: string;
  routedTo: 'nurse' | 'doctor' | 'emergency' | 'human';
  escalated: boolean;
  escalationLevel?: 'doctor' | 'emergency' | 'human';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
}

export class SymptomCheckerAgent {
  async checkSymptoms(symptoms: string): Promise<SymptomCheckResult> {
    const lower = symptoms.toLowerCase();
    
    // Critical symptoms - immediate emergency escalation
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'stroke', 'difficulty breathing', 
      'severe bleeding', 'unconscious', 'choking', 'severe allergic reaction',
      'suicide', 'overdose', 'severe burns', 'head injury'
    ];
    
    // High priority symptoms - doctor escalation
    const doctorKeywords = [
      'fever over 102', 'severe pain', 'persistent vomiting', 'severe headache',
      'vision problems', 'numbness', 'severe abdominal pain', 'blood in stool',
      'blood in urine', 'severe dizziness'
    ];

    // Check for emergency symptoms
    if (emergencyKeywords.some(keyword => lower.includes(keyword))) {
      const response = await emergencyAgent.assess(symptoms);
      return {
        assessment: response,
        routedTo: 'emergency',
        escalated: true,
        escalationLevel: 'emergency',
        urgencyLevel: 'critical',
        recommendedAction: 'Seek immediate emergency medical attention or call 911'
      };
    }

    // Check for doctor-level symptoms
    if (doctorKeywords.some(keyword => lower.includes(keyword))) {
      const response = await doctorAgent.stream([
        { role: 'user', content: `Please assess these symptoms: ${symptoms}` },
      ]);
      let output = '';
      for await (const chunk of response.textStream) {
        output += chunk;
      }
      return {
        assessment: output,
        routedTo: 'doctor',
        escalated: true,
        escalationLevel: 'doctor',
        urgencyLevel: 'high',
        recommendedAction: 'Schedule an appointment with a doctor within 24 hours'
      };
    }

    // Start with nurse practitioner for general assessment
    const nurseResponse = await nursePractitionerAgent.stream([
      { role: 'user', content: `Please assess these symptoms: ${symptoms}` },
    ]);
    let nurseOutput = '';
    for await (const chunk of nurseResponse.textStream) {
      nurseOutput += chunk;
    }

    // Check if nurse recommends escalation
    if (nurseOutput.toLowerCase().includes('see a doctor immediately') || 
        nurseOutput.toLowerCase().includes('emergency')) {
      const answer = await emergencyAgent.assess(symptoms);
      return {
        assessment: answer,
        routedTo: 'emergency',
        escalated: true,
        escalationLevel: 'emergency',
        urgencyLevel: 'critical',
        recommendedAction: 'Seek immediate emergency medical attention'
      };
    }

    if (nurseOutput.toLowerCase().includes('see a doctor') || 
        nurseOutput.toLowerCase().includes('medical attention')) {
      const answer = await doctorAgentWithAnswer.answer(symptoms);
      return {
        assessment: answer,
        routedTo: 'doctor',
        escalated: true,
        escalationLevel: 'doctor',
        urgencyLevel: 'medium',
        recommendedAction: 'Schedule an appointment with a doctor'
      };
    }

    if (nurseOutput.toLowerCase().includes('speak with someone') || 
        nurseOutput.toLowerCase().includes('human')) {
      const answer = await humanRepAgent.answer(symptoms);
      return {
        assessment: answer,
        routedTo: 'human',
        escalated: true,
        escalationLevel: 'human',
        urgencyLevel: 'low',
        recommendedAction: 'Speak with a healthcare representative'
      };
    }

    // No escalation needed - nurse can handle
    return {
      assessment: nurseOutput,
      routedTo: 'nurse',
      escalated: false,
      urgencyLevel: 'low',
      recommendedAction: 'Follow the provided guidance and monitor symptoms'
    };
  }
}