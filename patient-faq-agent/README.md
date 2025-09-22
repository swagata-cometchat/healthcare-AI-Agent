# Patient FAQ Agent

A Mastra-powered AI agent that provides healthcare information and answers common patient questions using a medical knowledge base.

## What it does

- Answers patient questions about symptoms, medications, preventive care, and procedures
- Provides general health information and guidance
- Always includes appropriate medical disclaimers
- Directs patients to seek professional medical care when appropriate
- Uses retrieval-augmented generation from a curated medical knowledge base

## Important Disclaimers

⚠️ **This agent provides educational information only and should never replace professional medical advice.**
- Always consult healthcare professionals for medical concerns
- For emergencies, call 911 or go to the nearest emergency room
- This agent does not provide medical diagnoses or specific treatment recommendations

## Prerequisites

- Node.js installed
- OpenAI API key
- Mastra framework

## Quick Start

1. **Install dependencies:**
```bash
cd patient-faq-agent
npm install
```

2. **Set up environment:**
```bash
cp .env.example .env
# Add your OPENAI_API_KEY to .env
```

3. **Start the server:**
```bash
npx mastra dev
```

4. **Ingest medical knowledge:**
```bash
curl -X POST http://localhost:4111/api/tools/ingestSources \
  -H 'Content-Type: application/json' \
  -d '{
    "files": [
      "knowledge/medical/general-patient-faq.md",
      "knowledge/medical/common-symptoms-guide.md",
      "knowledge/medical/emergency-care-guide.md"
    ],
    "namespace": "medical"
  }'
```

5. **Test the agent:**
```bash
curl -X POST http://localhost:4111/api/agents/patient-faq/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "@agent What should I do if I have a high fever?"
      }
    ],
    "toolParams": {"namespace": "medical"}
  }'
```

## API Endpoints

- `POST /api/tools/ingestSources` - Add medical content to knowledge base
- `POST /api/tools/searchDocs` - Search medical knowledge
- `POST /api/agents/patient-faq/generate` - Chat with the patient FAQ agent
- `GET /swagger-ui` - API documentation

## Project Structure

```
patient-faq-agent/
├── src/mastra/
│   ├── agents/
│   │   └── patient-faq-agent.ts    # Main agent definition
│   ├── tools/
│   │   ├── docs-retriever.ts       # Medical knowledge retrieval
│   │   ├── ingest-sources.ts       # Content ingestion
│   │   └── index.ts
│   ├── server/
│   │   ├── routes/
│   │   │   ├── ingest.ts
│   │   │   └── searchDocs.ts
│   │   ├── util/
│   │   │   └── safeErrorMessage.ts
│   │   └── routes.ts
│   └── index.ts                    # Mastra configuration
├── knowledge/
│   └── medical/                    # Medical FAQ content
│       ├── general-patient-faq.md
│       ├── common-symptoms-guide.md
│       └── emergency-care-guide.md
├── package.json
├── tsconfig.json
└── README.md
```

## Adding Medical Content

### From Files
```bash
curl -X POST http://localhost:4111/api/tools/ingestSources \
  -H 'Content-Type: application/json' \
  -d '{
    "files": ["path/to/medical-faq.md"],
    "namespace": "medical"
  }'
```

### From URLs
```bash
curl -X POST http://localhost:4111/api/tools/ingestSources \
  -H 'Content-Type: application/json' \
  -d '{
    "sources": ["https://example.com/medical-guidelines"],
    "namespace": "medical"
  }'
```

### From Text
```bash
curl -X POST http://localhost:4111/api/tools/ingestSources \
  -H 'Content-Type: application/json' \
  -d '{
    "sources": ["Q: What is a normal blood pressure? A: Normal blood pressure is typically less than 120/80 mmHg."],
    "namespace": "medical"
  }'
```

## Sample Questions

- "What should I do if I have a fever?"
- "When should I go to the emergency room vs urgent care?"
- "How often should I get routine checkups?"
- "What are the warning signs of a heart attack?"
- "What should I bring to my doctor's appointment?"

## Safety Features

- Automatic medical disclaimers
- Emergency situation recognition
- Referral to healthcare professionals
- Educational purpose emphasis
- No diagnosis or treatment recommendations

## Connect to CometChat

1. In CometChat Dashboard → AI Agents
2. Set Provider = Mastra
3. Agent ID = `patient-faq`
4. Deployment URL = `your-public-url/api/agents/patient-faq/generate`
5. Enable and save

## Development

- The agent uses GPT-4o for natural language processing
- Medical knowledge is stored in markdown files
- Vector search finds relevant information
- Responses include source citations

## License

ISC

## Support

For questions about implementation or medical content guidelines, please consult with healthcare professionals and refer to official medical resources.