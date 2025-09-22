export const emergencyAgent = {
  name: 'Emergency Medical Services',
  assess: async (symptoms: string) => {
    // Simulate emergency response for critical symptoms
    return `🚨 EMERGENCY ALERT: Based on the symptoms described (${symptoms}), this appears to require immediate medical attention. Please call 911 or go to the nearest emergency room immediately. Do not delay medical care. If you are experiencing a life-threatening emergency, hang up and call 911 now.`;
  },
};