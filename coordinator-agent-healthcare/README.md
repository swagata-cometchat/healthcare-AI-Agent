# Healthcare Appointment Coordinator Agent

A Mastra-powered AI agent that intelligently routes patients to appropriate healthcare professionals and schedules appointments based on their medical needs, symptoms, and urgency levels.

## What you'll build

- A healthcare appointment coordinator that analyzes patient requests
- Intelligent routing to appropriate medical professionals:
  - **General Practitioners** for routine checkups and general health concerns
  - **Specialists** for specific medical conditions requiring specialized care
  - **Nurse Practitioners** for minor health concerns and preventive care
  - **Emergency Services** for urgent medical needs requiring immediate attention
- Automated appointment scheduling with confirmation details
- Medical routing workflow with appropriate urgency levels

## Features

- 🏥 **Smart Medical Routing**: Automatically routes patients to the right healthcare provider
- 📅 **Appointment Scheduling**: Books appointments with preferred dates and times
- 🚨 **Emergency Detection**: Identifies urgent medical situations requiring immediate attention
- 📋 **Detailed Instructions**: Provides pre-appointment instructions and next steps
- 🔒 **Medical Disclaimers**: Includes appropriate medical disclaimers and safety guidance
- 📊 **Urgency Assessment**: Classifies requests by urgency level (low, medium, high, urgent)

## Prerequisites

- Node.js 20.9.0 or higher
- OpenAI API key
- Basic understanding of Mastra framework

## Quickstart

1. Install dependencies and run locally:

```bash
cd coordinator-agent-healthcare
npm install
npx mastra dev
```

2. Test the appointment coordinator (agent id is `appointmentCoordinatorAgent`):

### Routine checkup appointment:
```bash
curl -s -X POST http://localhost:4111/api/agents/appointmentCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need a routine checkup appointment for next week"}]}'
```

### Specialist appointment:
```bash
curl -s -X POST http://localhost:4111/api/agents/appointmentCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need to see a cardiologist for my heart condition next Friday afternoon"}]}'
```

### Nurse practitioner appointment:
```bash
curl -s -X POST http://localhost:4111/api/agents/appointmentCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need a flu shot vaccination"}]}'
```

The response includes appointment details, routing information, and a summary line like `([routedTo] | scheduled: yes/no | urgency: [urgencyLevel])`.

## How it works

1. **Patient Request Analysis**: The coordinator analyzes the patient's request to understand their medical needs
2. **Smart Routing**: Keywords and context determine the appropriate healthcare professional:
   - Routine care → General Practitioner
   - Specialized conditions → Specialist (Cardiologist, Dermatologist, etc.)
   - Minor concerns/preventive care → Nurse Practitioner
   - Emergency situations → Emergency Services
3. **Appointment Scheduling**: The system books appointments with realistic timing and provides confirmation details
4. **Instructions & Follow-up**: Patients receive detailed pre-appointment instructions and next steps

## Medical Routing Logic

### General Practitioner (Routine Care)
- Routine checkups and physical exams
- General health concerns and consultations
- Preventive care and health maintenance
- Follow-up appointments for ongoing conditions

### Specialist Care (Medium Priority)
- **Cardiologist**: Heart conditions, chest pain, cardiovascular concerns
- **Dermatologist**: Skin conditions, dermatological issues
- **Orthopedic**: Bone, joint, and musculoskeletal problems
- Conditions requiring specialized medical expertise
- Referral-based appointments

### Nurse Practitioner (Low Priority)
- Vaccinations and immunizations
- Blood pressure checks and routine monitoring
- Minor health concerns and wellness checks
- Prescription refills and follow-up care
- Preventive health services

### Emergency Services (Urgent Priority)
- Severe pain, bleeding, or trauma
- Difficulty breathing or chest pain
- Life-threatening conditions
- Immediate medical attention required

## API Endpoints

- `POST /api/agents/appointmentCoordinatorAgent/generate` — Schedule appointments and receive medical routing

Expected local base: `http://localhost:4111/api`

## Project Structure

```
coordinator-agent-healthcare/
├── src/mastra/
│   ├── index.ts                          # Main Mastra configuration
│   ├── agents/
│   │   ├── appointment-coordinator-agent.ts    # Main coordination logic
│   │   ├── general-practitioner-agent.ts      # GP scheduling
│   │   ├── specialist-agent.ts                # Specialist scheduling
│   │   ├── nurse-practitioner-agent.ts        # NP scheduling
│   │   └── emergency-scheduler-agent.ts       # Emergency routing
│   ├── tools/
│   │   └── appointment-coordinator-tool.ts    # Appointment scheduling tool
│   └── workflows/
│       └── appointment-scheduling-workflow.ts # Scheduling workflow
├── package.json                          # Project dependencies
├── tsconfig.json                         # TypeScript configuration
└── README.md                            # This file
```

## Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Sample Responses

### Routine Checkup (General Practitioner)
```json
{
  "message": "I've scheduled your routine checkup appointment with Dr. Sarah Johnson, General Practitioner. Your appointment is confirmed for September 23, 2025, at 10:00 AM...",
  "routedTo": "general-practitioner",
  "scheduled": true,
  "appointmentDetails": {
    "date": "2025-09-23",
    "time": "10:00 AM",
    "provider": "Dr. Sarah Johnson, MD",
    "location": "Main Medical Center, Room 201",
    "appointmentId": "GP-1758540030805"
  },
  "urgencyLevel": "low",
  "nextSteps": [
    "Arrive 15 minutes early for check-in",
    "Bring insurance card and photo ID",
    "Prepare list of current medications",
    "Write down any questions or concerns"
  ]
}
```

### Specialist Appointment (Cardiologist)
```json
{
  "message": "I've scheduled your specialist appointment with Dr. Michael Chen, Cardiologist...",
  "routedTo": "specialist",
  "scheduled": true,
  "appointmentDetails": {
    "date": "next Friday",
    "time": "afternoon",
    "provider": "Dr. Michael Chen, Cardiologist",
    "location": "Cardiology Department, 3rd Floor",
    "appointmentId": "SPEC-1758540142444"
  },
  "urgencyLevel": "medium",
  "nextSteps": [
    "Obtain referral from primary care physician if required",
    "Bring insurance card and photo ID",
    "Bring relevant medical records or test results",
    "Arrive 20 minutes early for specialist check-in",
    "Prepare detailed medical history and symptom list"
  ]
}
```

## Connect to CometChat

1. In CometChat Dashboard → AI Agents, set Provider = Mastra
2. Agent ID = `appointmentCoordinatorAgent`
3. Deployment URL = your public `/api/agents/appointmentCoordinatorAgent/generate`
4. Enable and save

## Medical Disclaimers

⚠️ **Important Medical Disclaimer**: This AI agent is designed to provide appointment scheduling assistance only. It is not a substitute for professional medical diagnosis, treatment, or advice. Always consult with qualified healthcare professionals for medical concerns. In case of emergency, call 911 or go to the nearest emergency room immediately.

## Security & Compliance Considerations

- **HIPAA Compliance**: Ensure proper data handling for medical information
- **Authentication**: Implement proper user authentication and authorization  
- **Data Privacy**: Secure storage and transmission of health data
- **Audit Logging**: Log all appointment scheduling for compliance
- **Rate Limiting**: Prevent abuse of medical services
- **Input Validation**: Sanitize and validate all user inputs

## Testing Scenarios

### Test General Practitioner Routing
```bash
curl -X POST http://localhost:4111/api/agents/appointmentCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need a routine physical exam"}]}'
```

### Test Specialist Routing
```bash
curl -X POST http://localhost:4111/api/agents/appointmentCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need to see a dermatologist for a skin condition"}]}'
```

### Test Nurse Practitioner Routing
```bash
curl -X POST http://localhost:4111/api/agents/appointmentCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need a wellness check and blood pressure monitoring"}]}'
```

## Troubleshooting

- **Wrong routing**: Check keyword detection logic in `appointment-coordinator-agent.ts`
- **Agent not found**: Verify agent registration in `index.ts`
- **No response**: Check server logs and ensure all dependencies are installed
- **OpenAI errors**: Verify your API key is valid and has sufficient credits
- **Emergency routing issues**: OpenAI safety filters may trigger on medical emergency keywords

## Customization

### Adding New Medical Keywords
Edit the keyword arrays in `appointment-coordinator-agent.ts`:
- `emergencyKeywords`: For critical symptoms requiring immediate attention
- `specialistKeywords`: For conditions requiring specialist care
- `nursePractitionerKeywords`: For minor health concerns and preventive care

### Modifying Routing Logic
Update the `scheduleAppointment` method in `AppointmentCoordinatorAgent` class to adjust routing behavior.

### Adding New Healthcare Providers
1. Create new agent in `agents/` directory
2. Import and use in `appointment-coordinator-agent.ts`
3. Update routing enums in schemas

### Customizing Appointment Details
Modify the scheduling logic in individual agent files to adjust:
- Provider names and specialties
- Location information
- Appointment timing logic
- Pre-appointment instructions

## Performance Considerations

- **Response Time**: Appointment scheduling typically completes in 2-5 seconds
- **Rate Limits**: Respect OpenAI API rate limits for production use
- **Concurrent Users**: Scale appropriately for expected user load
- **Database Storage**: Consider using persistent storage for appointment tracking

## License

ISC

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Mastra documentation: [https://mastra.ai/docs](https://mastra.ai/docs)
- Verify your environment setup and API keys

<p align="left"> <img src="https://komarev.com/ghpvc/?username=swagata-cometchat" alt="swagata-cometchat" /> </p>
