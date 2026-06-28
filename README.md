# ProdScreen - Production Grade MERN Platform

This project implements the production tracking product from the provided PDF and is built with a MERN architecture:

- **MongoDB**: core operational data store
- **Express + Node.js**: secure API layer with RBAC and integration endpoints
- **React (Vite)**: production input, admin setup, and analytics dashboard UI

## Implemented from requirements

- Unlimited process master setup
- Shift configuration (up to 3 shifts, start/end/lunch/breaks)
- Configurable table template metadata (numeric/text/dropdown/time-range)
- Hour-by-hour production input screen with target/actual/gap/comments
- Quality defect and scrap capture at hourly level
- Shift totals and trend analytics
- AI-ready insights endpoint using Claude API
- KPI+ integration adapter for outbound sync
- Hardware ingestion endpoint for barcode/RFID/camera/photoeye/sensors
- User authentication and role management (`admin`, `supervisor`, `operator`, `viewer`)

## Folder structure

```text
.
├── client
│   ├── src
│   │   ├── pages (Login, Dashboard, Input, Admin)
│   │   ├── components (Layout, ProtectedRoute)
│   │   ├── context (AuthContext)
│   │   └── api
├── server
│   ├── src
│   │   ├── config, middleware, models, routes, controllers, services
└── docker-compose.yml
```

## Environment

Copy and customize:

- `server/.env.example` -> `server/.env`
- `client/.env.example` -> `client/.env`

Minimum server settings:

- `MONGO_URI`
- `JWT_SECRET`

Optional integrations:

- `CLAUDE_API_KEY`
- `KPI_PLUS_BASE_URL`
- `KPI_PLUS_API_KEY`

## Run locally

### API

```bash
cd server
npm install
npm run dev
```

### Web

```bash
cd client
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```

- API: `http://localhost:4000`
- Web: `http://localhost:8080`

## Production-grade notes

- Input validation with `express-validator`
- Security middleware: `helmet`, CORS, compression, and rate limiting
- Structured logging using `pino`
- Role-based authorization guards on protected routes
- Clear integration boundaries for KPI+ and hardware adapters

## AWS deployment direction

- Containerize API and web with provided Dockerfiles
- Deploy API to ECS/Fargate (or EKS) + MongoDB Atlas
- Deploy web container behind ALB or serve static bundle via S3 + CloudFront
- Store secrets in AWS Secrets Manager / SSM Parameter Store
