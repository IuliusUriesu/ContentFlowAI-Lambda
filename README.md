# ContentFlowAI-Lambda

This package contains the backend logic for the ContentFlowAI application, implemented as AWS Lambda functions written in TypeScript.

Each function is automatically deployed via AWS CDK and powers either a public-facing API endpoint or a background processing task triggered by SQS.

---

## 🧠 Architecture

- **API Handlers**: One Lambda function per API Gateway endpoint.
- **Worker Functions**: A set of background worker Lambdas triggered by SQS events for asynchronous processing.

All functions are deployed and managed using the [`ContentFlowAI-CDK`](https://github.com/IuliusUriesu/ContentFlowAI-CDK) package.

---

## ⚙️ Tech Stack

- **Language**: TypeScript
- **Deployed With**: AWS CDK
- **Libraries Used**:
  - [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk) – for interacting with the Anthropic API
  - [`zod`](https://github.com/colinhacks/zod) – for runtime schema validation and input parsing
  - [`@aws-crypto/client-node`](https://github.com/aws/aws-encryption-sdk-javascript) – for encrypting users' Anthropic API keys before storing them in DynamoDB

---

## 🌐 API Authentication

All API-facing Lambda functions are protected using **Amazon Cognito**, and requests must include a valid user access token in the `Authorization` header.

Worker Lambdas triggered by SQS events are not publicly exposed and do not require authentication.

---

## 🔧 Environment Variables

Environment variables are provisioned via CDK at deploy time. No `.env` file is used in this package.

---

## 📁 Project Structure

```text
ContentFlowAI-Lambda/
├── src/
│   ├── handlers/
│   │   ├── api/               # API Gateway request handlers
│   │   └── workers/           # SQS-triggered background workers
│   ├── models/
│   │   ├── api/               # API-specific models
│   │   ├── domain/            # Domain-level entities and value objects
│   │   └── dto/               # Data Transfer Objects
│   ├── services/
│   │   ├── anthropic-api/     # Anthropic SDK integration
│   │   ├── aws-encryption-sdk/ # Encryption helpers
│   │   ├── dynamodb/          # Database access logic
│   │   └── sqs/               # SQS utility functions
│   └── utils/                 # Shared utilities
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 Testing & Deployment

Local execution is not supported. All testing is done by deploying to a dedicated AWS testing environment using CDK.

---

## 🛠 Maintainer

Built and maintained by Iulius Urieșu.
