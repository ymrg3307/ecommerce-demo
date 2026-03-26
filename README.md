# CTT Shopping Demo

Minimal final-demo implementation for the CTT online shopping website.

## Apps

- `frontend`: React + Vite demo UI
- `backend`: NestJS API with MongoDB Atlas and DynamoDB integrations

## Demo flows

- Login
- Search
- Product details
- Commit-only frontend deployment proof with visible GUID from `frontend/src/config/demo.ts`

## Local setup

1. Install dependencies: `npm install`
2. Copy env files:
   - `cp frontend/.env.example frontend/.env`
   - `cp backend/.env.example backend/.env`
3. Start backend: `npm run dev --workspace backend`
4. Start frontend: `npm run dev --workspace frontend`

The backend supports a seeded in-memory fallback when MongoDB or DynamoDB are not configured, so the demo can still run locally before cloud resources are connected.
