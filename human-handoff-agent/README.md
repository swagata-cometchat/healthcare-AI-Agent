# Medical Symptom Checker Agent with Human Handoff

A Mastra-powered AI agent that assesses medical symptoms and intelligently routes patients to appropriate healthcare professionals (nurse practitioner, doctor, emergency services) or human representatives based on symptom severity and urgency.

## What you'll build

- A symptom checker agent that analyzes health symptoms and determines appropriate care level
- Specialist medical agents (nurse practitioner, doctor, emergency services, human rep)
- Intelligent routing based on symptom severity and medical keywords
- Emergency escalation for critical symptoms
- Human handoff capabilities for complex cases

## Features

- **Multi-level Medical Assessment**: Routes to nurse practitioner, doctor, emergency, or human rep
- **Urgency Classification**: Categorizes symptoms as low, medium, high, or critical urgency
- **Emergency Detection**: Automatically escalates life-threatening symptoms to emergency services
- **Professional Medical Guidance**: Provides appropriate medical disclaimers and professional advice
- **Human Handoff**: Escalates to human representatives when needed

## Prerequisites

- Node.js 20.9.0 or higher
- A Mastra project
- CometChat app (optional, for integration)
- Environment: `.env` with `OPENAI_API_KEY`

## Quickstart

1. Install dependencies and run locally:

```bash
cd human-handoff-agent
npm install
npx mastra dev
```

2. Test the symptom checker (agent id is `symptomCheckerAgent`):

### Basic symptom check:
```bash
curl -s -X POST http://localhost:4111/api/agents/symptomCheckerAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"@agent I have a mild headache and feel tired"}]}'
```

### Emergency symptom check:
```bash
curl -s -X POST http://localhost:4111/api/agents/symptomCheckerAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"@agent I am experiencing severe chest pain and difficulty breathing"}]}'
```

### Doctor-level symptom check:
```bash
curl -s -X POST http://localhost:4111/api/agents/symptomCheckerAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"@agent I have a fever over 102 and severe abdominal pain"}]}'
```

The response includes medical assessment, urgency level, and a summary line like `([routedTo] | urgency: [urgencyLevel] | escalated: yes/no)`.

## How it works

1. **Symptom Analysis**: The agent analyzes the patient's symptom description
2. **Keyword Detection**: Identifies emergency or high-priority medical keywords
3. **Routing Decision**: Routes to appropriate medical professional based on severity:
   - **Emergency**: Life-threatening symptoms (chest pain, stroke, severe bleeding)
   - **Doctor**: Serious symptoms requiring medical attention (high fever, severe pain)
   - **Nurse Practitioner**: General health concerns and initial assessment
   - **Human Representative**: Complex cases requiring personal attention
4. **Assessment**: The selected specialist provides appropriate medical guidance
5. **Response**: Returns assessment with urgency level and recommended actions

## Medical Routing Logic

### Emergency Escalation (Critical)
- Chest pain, heart attack, stroke
- Difficulty breathing, severe bleeding
- Unconsciousness, severe allergic reactions
- Suicide ideation, overdose, severe burns

### Doctor Escalation (High Priority)
- Fever over 102°F
- Severe or persistent pain
- Vision problems, numbness
- Blood in stool/urine, severe dizziness

### Nurse Practitioner (Initial Assessment)
- General health concerns
- Minor symptoms requiring guidance
- Health questions and advice

### Human Representative
- Complex cases requiring personal attention
- Emotional support needs
- Insurance or administrative questions

## API Endpoints

- `POST /api/agents/symptomCheckerAgent/generate` — Assess symptoms and receive medical routing

Expected local base: `http://localhost:4111/api`

## Project Structure

```
human-handoff-agent/
├── src/mastra/
│   ├── index.ts                          # Main Mastra configuration
│   ├── agents/
│   │   ├── symptom-checker-agent.ts      # Main symptom assessment logic
│   │   ├── nurse-practitioner-agent.ts   # Nurse practitioner AI agent
│   │   ├── doctor-agent.ts               # Doctor AI agent
│   │   ├── emergency-agent.ts            # Emergency response handler
│   │   └── human-rep-agent.ts            # Human representative handler
│   ├── tools/
│   │   └── symptom-checker-tool.ts       # Symptom assessment tool
│   └── workflows/
│       └── symptom-checker-workflow.ts   # Assessment workflow
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

### Low Urgency (Nurse Practitioner)
```
Input: "I have a mild headache"
Response: Assessment with home care recommendations
Summary: (nurse | urgency: low | escalated: no)
```

### High Urgency (Doctor)
```
Input: "I have a fever over 102 and severe abdominal pain"
Response: Medical assessment with doctor appointment recommendation
Summary: (doctor | urgency: high | escalated: yes)
```

### Critical Urgency (Emergency)
```
Input: "I'm having chest pain and difficulty breathing"
Response: Emergency alert with immediate medical attention instructions
Summary: (emergency | urgency: critical | escalated: yes)
```

## Connect to CometChat

1. In CometChat Dashboard → AI Agents, set Provider = Mastra
2. Agent ID = `symptomCheckerAgent`
3. Deployment URL = your public `/api/agents/symptomCheckerAgent/generate`
4. Enable and save

## Medical Disclaimers

⚠️ **Important Medical Disclaimer**: This AI agent is designed to provide general health information and guidance only. It is not a substitute for professional medical diagnosis, treatment, or advice. Always consult with qualified healthcare professionals for medical concerns. In case of emergency, call 911 or go to the nearest emergency room immediately.

## Security & Compliance Considerations

- **HIPAA Compliance**: Ensure proper data handling for medical information
- **Authentication**: Implement proper user authentication and authorization
- **Data Privacy**: Secure storage and transmission of health data
- **Audit Logging**: Log all medical assessments for compliance
- **Rate Limiting**: Prevent abuse of medical services
- **Input Validation**: Sanitize and validate all user inputs

## Testing Scenarios

### Test Emergency Detection
```bash
# Should route to emergency
curl -X POST http://localhost:4111/api/agents/symptomCheckerAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I think I am having a heart attack"}]}'
```

### Test Doctor Escalation
```bash
# Should route to doctor
curl -X POST http://localhost:4111/api/agents/symptomCheckerAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I have severe headache and vision problems"}]}'
```

### Test Nurse Assessment
```bash
# Should route to nurse practitioner
curl -X POST http://localhost:4111/api/agents/symptomCheckerAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I have a cold and sore throat"}]}'
```

## Troubleshooting

- **Wrong routing**: Check keyword detection logic in `symptom-checker-agent.ts`
- **Agent not found**: Verify agent registration in `index.ts`
- **No response**: Check server logs and ensure all dependencies are installed
- **OpenAI errors**: Verify your API key is valid and has sufficient credits

## Customization

### Adding New Medical Keywords
Edit the keyword arrays in `symptom-checker-agent.ts`:
- `emergencyKeywords`: For critical symptoms
- `doctorKeywords`: For serious symptoms requiring medical attention

### Modifying Routing Logic
Update the `checkSymptoms` method in `SymptomCheckerAgent` class to adjust routing behavior.

### Adding New Specialists
1. Create new agent in `agents/` directory
2. Import and use in `symptom-checker-agent.ts`
3. Update routing enums in schemas

## License

ISC

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Mastra documentation
- Check agent logs for detailed error information

---

**Remember**: This is a demonstration application. For production medical applications, ensure proper medical oversight, compliance with healthcare regulations, and integration with qualified medical professionals.