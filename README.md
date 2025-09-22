# Healthcare AI Agent Collection

A comprehensive suite of Mastra-powered AI agents designed to streamline healthcare operations, from patient interactions to administrative workflows. This collection includes four specialized agents that work together to provide a complete healthcare AI solution.

## 🏥 What's Included

### 1. [Patient FAQ Agent](./patient-faq-agent/)
**Provides healthcare information and answers patient questions**
- Answers common patient questions using a medical knowledge base
- Provides general health information and guidance
- Includes appropriate medical disclaimers
- Uses retrieval-augmented generation from curated medical content
- Directs patients to seek professional medical care when appropriate

### 2. [Human Handoff Agent](./human-handoff-agent/)
**Medical symptom checker with intelligent routing**
- Assesses medical symptoms and determines appropriate care level
- Routes patients to nurse practitioner, doctor, emergency services, or human representatives
- Emergency detection for life-threatening symptoms
- Multi-level medical assessment with urgency classification
- Professional medical guidance with appropriate disclaimers

### 3. [Coordinator Agent Healthcare](./coordinator-agent-healthcare/)
**Intelligent appointment scheduling and medical routing**
- Smart medical routing to appropriate healthcare professionals
- Automated appointment scheduling with confirmation details
- Routes to General Practitioners, Specialists, Nurse Practitioners, or Emergency Services
- Urgency assessment and classification
- Detailed pre-appointment instructions and next steps

### 4. [Patient Onboarding Workflow Agent](./patient-onboarding-workflow-agent/)
**Complete patient registration and verification system**
- Step-by-step guided patient onboarding process
- KYC document processing with OCR validation
- Identity verification against official databases
- Insurance verification and eligibility validation
- HIPAA compliance checking and audit trails
- Real-time status tracking and workflow management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- OpenAI API key
- Basic understanding of Mastra framework

### Installation
1. Clone this repository
2. Navigate to any agent directory
3. Install dependencies: `npm install`
4. Set up environment variables (see individual agent READMEs)
5. Start the development server: `npx mastra dev`

### Environment Setup
Each agent requires an `.env` file with your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🗂 Cloning & Running an Individual Agent

Follow these steps to work with any single agent in this monorepo-style collection.

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/healthcare-AI-Agent.git
cd healthcare-AI-Agent
```
(Replace the URL with the actual repository URL if different.)

### 2. Choose an Agent Directory
Available agent folders:
- patient-faq-agent
- human-handoff-agent
- coordinator-agent-healthcare
- patient-onboarding-workflow-agent

Example (run the Patient FAQ Agent):
```bash
cd patient-faq-agent
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Environment Variables
Create a `.env` file in the agent folder (if one does not already exist):
```bash
OPENAI_API_KEY=your_openai_api_key_here
```
Add any other keys required by that specific agent (see its README if present).

### 5. Start the Agent in Dev Mode
All agents expose a dev script:
```bash
npm run dev
```
This runs the Mastra dev server (defaults to port 4111 unless configured otherwise). Check the console output for the exact URL.

### 6. Test the Agent Endpoint
Use the appropriate endpoint for the agent you started. Example (Patient FAQ Agent):
```bash
curl -X POST http://localhost:4111/api/agents/patient-faq/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What are symptoms of dehydration?"}]}'
```

### 7. Stop the Server
Press Ctrl+C in the terminal.

---

## 🔁 Running a Different Agent
From the repo root:
```bash
cd human-handoff-agent && npm install && npm run dev
```
(or substitute another folder name.)

## 🧩 Install All Agents (Optional Convenience)
If you want to install dependencies for all agents at once:
```bash
for d in patient-faq-agent human-handoff-agent coordinator-agent-healthcare patient-onboarding-workflow-agent; do \
  (cd $d && npm install); \
done
```
Then start whichever one you need by entering its folder and running `npm run dev`.

## 🔧 Common Issues When Running
- Missing OPENAI_API_KEY: Ensure `.env` exists in the agent directory
- Port already in use: Stop other running agents or set a different port via environment or config
- Dependency errors: Re-run `npm install`

## 🏗️ Architecture Overview

```
Healthcare AI Agent Collection
├── Patient FAQ Agent           # Medical information & FAQ responses
├── Human Handoff Agent         # Symptom assessment & routing
├── Coordinator Agent           # Appointment scheduling & coordination  
└── Patient Onboarding         # Registration & verification workflow
```

### Integration Flow
1. **Patient Onboarding** → Register and verify new patients
2. **Patient FAQ** → Answer general health questions and concerns
3. **Human Handoff** → Assess symptoms and determine care level
4. **Coordinator Agent** → Schedule appropriate appointments

## 🔧 API Endpoints

Each agent provides REST API endpoints for integration:

- **Patient FAQ**: `/api/agents/patient-faq/generate`
- **Symptom Checker**: `/api/agents/symptomCheckerAgent/generate`
- **Appointment Coordinator**: `/api/agents/appointmentCoordinatorAgent/generate`
- **Patient Onboarding**: `/api/agents/patient-onboarding/generate`

## 🎯 Use Cases

### Healthcare Providers
- **Hospitals**: Complete patient management from onboarding to discharge
- **Clinics**: Streamlined appointment scheduling and patient triage
- **Urgent Care**: Quick symptom assessment and appropriate routing
- **Specialists**: Automated referral processing and appointment coordination

### Patient Experience
- **24/7 Health Information**: Get answers to common health questions anytime
- **Symptom Assessment**: Receive appropriate care recommendations based on symptoms
- **Easy Scheduling**: Book appointments with the right healthcare provider
- **Smooth Onboarding**: Complete registration process with guided assistance

## 🔒 Security & Compliance

### Medical Standards
- **HIPAA Compliance**: Built-in privacy and security measures
- **Medical Disclaimers**: Appropriate disclaimers for all medical interactions
- **Professional Standards**: Aligned with healthcare best practices
- **Emergency Protocols**: Proper escalation for urgent medical situations

### Data Protection
- Secure data handling and transmission
- Encrypted storage of sensitive information
- Audit trails for compliance monitoring
- Input validation and sanitization

## 🚨 Important Medical Disclaimers

⚠️ **Critical Notice**: These AI agents are designed to provide information and assistance only. They are not substitutes for professional medical diagnosis, treatment, or advice. 

- Always consult qualified healthcare professionals for medical concerns
- For emergencies, call 911 or go to the nearest emergency room immediately
- These agents provide educational information and administrative assistance only
- No agent should be used for actual medical diagnosis or treatment decisions

## 🧪 Testing

Each agent can be tested individually using cURL commands or integrated into your application. See individual agent READMEs for specific testing examples.

### Example: Test Symptom Checker
```bash
curl -X POST http://localhost:4111/api/agents/symptomCheckerAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I have a mild headache"}]}'
```

### Example: Schedule Appointment
```bash
curl -X POST http://localhost:4111/api/agents/appointmentCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need a routine checkup"}]}'
```

## 🔗 Connect to CometChat

Each agent can be integrated with CometChat for real-time patient interactions:

1. In CometChat Dashboard → AI Agents
2. Set Provider = Mastra
3. Configure the appropriate Agent ID for each service
4. Set your deployment URL
5. Enable and save

## 📊 Monitoring & Analytics

Track important healthcare metrics across all agents:
- **Patient Satisfaction**: Monitor interaction quality and outcomes
- **Response Times**: Ensure timely medical guidance and scheduling
- **Routing Accuracy**: Verify patients reach appropriate care levels
- **Onboarding Success**: Track registration completion rates
- **Compliance Metrics**: Monitor HIPAA and regulatory adherence

## 🔧 Customization

### Adding New Medical Content
- Update knowledge base files in `patient-faq-agent/knowledge/medical/`
- Add new medical keywords for routing in symptom checker
- Customize appointment types and healthcare providers
- Modify onboarding workflow steps as needed

### Extending Functionality
- Add new specialist types and routing logic
- Integrate with external EMR systems
- Connect to real insurance verification APIs
- Implement additional compliance checks

## 🆘 Troubleshooting

### Common Issues
- **API Key Errors**: Verify OpenAI API key is valid and has sufficient credits
- **Agent Not Found**: Check agent registration in individual `index.ts` files
- **Routing Issues**: Review keyword detection logic in respective agents
- **Database Errors**: Ensure proper database configuration for persistent storage

### Support Resources
- Check individual agent READMEs for specific troubleshooting
- Review Mastra framework documentation
- Verify environment setup and dependencies
- Check server logs for detailed error information

## 📈 Performance Considerations

- **Response Times**: Most operations complete within 2-5 seconds
- **Concurrent Users**: Scale infrastructure based on expected load
- **Rate Limits**: Respect OpenAI API rate limits in production
- **Database Performance**: Use appropriate storage solutions for scale

## 🔄 Development Workflow

1. **Choose an Agent**: Start with the most relevant agent for your use case
2. **Set Up Environment**: Follow the quick start guide for your chosen agent
3. **Test Functionality**: Use provided cURL examples to verify operation
4. **Customize**: Modify prompts, routing logic, and responses as needed
5. **Integrate**: Connect to your healthcare systems and patient interfaces
6. **Deploy**: Follow Mastra deployment guidelines for production

## 📞 Support

For technical support:
- Review individual agent documentation in their respective folders
- Check the troubleshooting sections for common solutions
- Ensure all environment variables are properly configured
- Verify Mastra framework setup and dependencies

---

**⚠️ Production Considerations**: Replace mock services with real healthcare APIs, implement proper authentication, ensure HIPAA compliance, and conduct thorough security audits before production deployment.