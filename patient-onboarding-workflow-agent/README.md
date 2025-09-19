# Patient Onboarding Workflow Agent

A comprehensive Mastra-powered AI agent that handles smooth patient onboarding with KYC (Know Your Customer) and insurance verification processes for healthcare organizations.

## 🏥 Features

- **Complete Patient Onboarding Workflow**: Step-by-step guided process
- **KYC Document Processing**: OCR and validation for driver's licenses, passports, insurance cards
- **Identity Verification**: Multi-factor identity verification against official databases
- **Insurance Verification**: Real-time insurance coverage and eligibility validation
- **HIPAA Compliance**: Built-in compliance checking and audit trails
- **Workflow Management**: Intelligent decision-making for process progression
- **Real-time Status Tracking**: Monitor onboarding progress at each step

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key
- Mastra framework

### Installation

1. **Navigate to the project directory:**
```bash
cd patient-onboarding-workflow-agent
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Add your OPENAI_API_KEY to .env
```

4. **Start the development server:**
```bash
npm run dev
```

The server will start on `http://localhost:4111` with Swagger UI available at `http://localhost:4111/swagger-ui`

## 📋 Workflow Steps

1. **Initiate Onboarding** - Create new patient onboarding session
2. **Collect Personal Information** - Gather demographic and contact details
3. **Collect Insurance Information** - Insurance provider and policy details
4. **Process KYC Documents** - Upload and verify identity documents
5. **Identity Verification** - Verify against government databases
6. **Insurance Verification** - Validate coverage and eligibility
7. **Compliance Check** - Ensure HIPAA and regulatory compliance
8. **Complete Onboarding** - Finalize patient registration

## 🔧 API Endpoints

### Core Workflow Endpoints

- `POST /api/onboarding/initiate` - Start new patient onboarding
- `PUT /api/onboarding/:patientId/patient-info` - Update patient information
- `PUT /api/onboarding/:patientId/insurance-info` - Update insurance information
- `POST /api/onboarding/:patientId/process-document` - Process KYC documents
- `POST /api/onboarding/:patientId/verify-identity` - Verify patient identity
- `POST /api/onboarding/:patientId/verify-insurance` - Verify insurance coverage
- `POST /api/onboarding/:patientId/check-compliance` - Check regulatory compliance
- `GET /api/onboarding/:patientId/status` - Get onboarding status

### Agent Endpoints

- `POST /api/agents/patient-onboarding/generate` - Chat with onboarding agent
- `POST /api/agents/workflow-manager/generate` - Interact with workflow manager

## 🧪 Testing with cURL

### 1. Initiate Patient Onboarding

```bash
curl -X POST http://localhost:4111/api/onboarding/initiate \
  -H 'Content-Type: application/json' \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": true,
  "patientId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "initiated",
  "message": "Patient onboarding initiated successfully",
  "nextSteps": [
    "Collect personal information",
    "Upload KYC documents",
    "Verify identity",
    "Validate insurance coverage"
  ]
}
```

### 2. Update Patient Information

```bash
# Replace {patientId} with the actual patient ID from step 1
curl -X PUT http://localhost:4111/api/onboarding/{patientId}/patient-info \
  -H 'Content-Type: application/json' \
  -d '{
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-05-15",
      "ssn": "123-45-6789",
      "phone": "+1-555-123-4567",
      "email": "john.doe@email.com",
      "address": {
        "street": "123 Main Street",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "90210"
      }
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+1-555-987-6543"
    }
  }'
```

### 3. Update Insurance Information

```bash
curl -X PUT http://localhost:4111/api/onboarding/{patientId}/insurance-info \
  -H 'Content-Type: application/json' \
  -d '{
    "primaryInsurance": {
      "provider": "Blue Cross Blue Shield",
      "policyNumber": "BC123456789",
      "groupNumber": "GRP001",
      "subscriberName": "John Doe",
      "subscriberDOB": "1990-05-15",
      "relationshipToSubscriber": "self"
    }
  }'
```

### 4. Process KYC Document

```bash
curl -X POST http://localhost:4111/api/onboarding/{patientId}/process-document \
  -H 'Content-Type: application/json' \
  -d '{
    "documentType": "drivers_license",
    "documentImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
  }'
```

### 5. Verify Identity

```bash
curl -X POST http://localhost:4111/api/onboarding/{patientId}/verify-identity \
  -H 'Content-Type: application/json' \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": true,
  "patientId": "123e4567-e89b-12d3-a456-426614174000",
  "verified": true,
  "score": 95,
  "checks": {
    "nameMatch": true,
    "dobMatch": true,
    "addressMatch": true,
    "ssnValid": true,
    "documentAuthentic": true
  },
  "riskLevel": "low",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Verify Insurance

```bash
curl -X POST http://localhost:4111/api/onboarding/{patientId}/verify-insurance \
  -H 'Content-Type: application/json' \
  -d '{}'
```

### 7. Check Compliance

```bash
curl -X POST http://localhost:4111/api/onboarding/{patientId}/check-compliance \
  -H 'Content-Type: application/json' \
  -d '{
    "hasConsent": true,
    "hasPrivacyNotice": true,
    "hasDataAgreement": true
  }'
```

### 8. Get Onboarding Status

```bash
curl -X GET http://localhost:4111/api/onboarding/{patientId}/status \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "patientId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "onboarding_completed",
  "progress": {
    "personalInfoCollected": true,
    "insuranceInfoCollected": true,
    "documentsUploaded": true,
    "identityVerified": true,
    "insuranceVerified": true,
    "complianceComplete": true
  },
  "verificationResults": {
    "identityVerified": true,
    "insuranceVerified": true,
    "identityScore": 95,
    "insuranceEligible": true
  }
}
```

## 🤖 Testing with AI Agents

### Chat with Patient Onboarding Agent

```bash
curl -X POST http://localhost:4111/api/agents/patient-onboarding/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "@agent I need help with patient onboarding. Can you guide me through the process?"
      }
    ]
  }'
```

### Workflow Management

```bash
curl -X POST http://localhost:4111/api/agents/workflow-manager/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Patient ID 123e4567-e89b-12d3-a456-426614174000 has completed identity verification with score 75. What should be the next step?"
      }
    ]
  }'
```

## 🏗️ Project Structure

```
patient-onboarding-workflow-agent/
├── src/
│   ├── mastra/
│   │   ├── agents/
│   │   │   └── onboarding-agent.ts       # AI agents for onboarding
│   │   ├── tools/
│   │   │   ├── verification-tools.ts     # KYC & verification tools
│   │   │   └── index.ts
│   │   ├── server/
│   │   │   ├── routes/
│   │   │   │   └── onboarding.ts         # API route handlers
│   │   │   ├── util/
│   │   │   │   └── safeErrorMessage.ts
│   │   │   └── routes.ts                 # Route configuration
│   │   └── index.ts                      # Mastra app configuration
│   └── types/
│       └── patient.ts                    # TypeScript types & schemas
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔒 Security & Compliance

### HIPAA Compliance Features

- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Audit Trails**: Complete logging of all patient data access
- **Access Controls**: Role-based access to patient information
- **Consent Management**: Proper consent tracking and documentation
- **Data Minimization**: Only collect necessary information

### Security Best Practices

- Input validation using Zod schemas
- Secure document processing with OCR validation
- Identity verification against official databases
- Insurance eligibility verification with real-time API calls
- Comprehensive error handling and logging

## 🎯 Use Cases

### Healthcare Providers

- **Hospitals**: Streamline patient admission processes
- **Clinics**: Verify patient eligibility before appointments
- **Urgent Care**: Quick patient onboarding for immediate care
- **Specialists**: Verify referrals and insurance coverage

### Insurance Companies

- **Claims Processing**: Verify patient identity for claims
- **Provider Networks**: Validate patient eligibility
- **Fraud Prevention**: Detect identity inconsistencies

## 🔧 Configuration

### Environment Variables

```bash
OPENAI_API_KEY=""                    # Required: OpenAI API key
DATABASE_URL="file:../mastra.db"     # Database connection
INSURANCE_API_KEY=""                 # Optional: Insurance provider API
ID_VERIFICATION_API_KEY=""           # Optional: Identity verification service
PORT=4111                            # Server port
NODE_ENV=development                 # Environment
```

### Customization

- **Document Types**: Add support for additional document types in `verification-tools.ts`
- **Verification Rules**: Modify validation logic in the verification tools
- **Workflow Steps**: Customize the onboarding workflow in `onboarding-agent.ts`
- **Compliance Rules**: Update compliance checks in `complianceChecker` tool

## 🚨 Error Handling

The system includes comprehensive error handling for:

- Invalid document formats or unreadable images
- Failed identity verification (low confidence scores)
- Insurance policy not found or expired
- Missing required information
- System integration failures
- Compliance violations

## 📈 Monitoring & Analytics

Track key metrics:

- **Onboarding Completion Rate**: Percentage of successful onboardings
- **Verification Success Rate**: Identity and insurance verification rates
- **Processing Time**: Average time per workflow step
- **Error Rates**: Failed verifications and system errors
- **Compliance Score**: HIPAA and regulatory compliance metrics

## 🔄 Integration

### Healthcare Systems

- **EMR Integration**: Connect with Electronic Medical Records
- **Practice Management**: Integrate with scheduling systems
- **Billing Systems**: Link with insurance and billing platforms

### Third-party Services

- **OCR Services**: Integrate with advanced document processing
- **Identity Verification**: Connect with Experian, LexisNexis, etc.
- **Insurance APIs**: Real-time verification with major providers

## 🆘 Troubleshooting

### Common Issues

1. **Document Processing Fails**
   - Ensure image is clear and readable
   - Check supported document types
   - Verify image format (JPEG, PNG)

2. **Identity Verification Low Score**
   - Verify personal information accuracy
   - Check document authenticity
   - Ensure consistent information across documents

3. **Insurance Verification Fails**
   - Confirm policy is active
   - Check policy number format
   - Verify subscriber information

### Debug Mode

Enable detailed logging:
```bash
NODE_ENV=development npm run dev
```

## 📞 Support

For technical support or questions:

- Review the API documentation at `/swagger-ui`
- Check the troubleshooting section above
- Ensure all environment variables are properly configured

## 🔐 Security Notice

This is a demonstration application with mock verification services. In production:

- Use real identity verification APIs
- Implement proper database encryption
- Add authentication and authorization
- Enable audit logging
- Follow HIPAA compliance guidelines
- Regular security audits and penetration testing

## 📄 License

ISC License - See LICENSE file for details.

---

**⚠️ Important**: This application includes mock verification services for demonstration purposes. Replace with actual service integrations for production use.