# CTT Shopping Demo

Reduced-scope shopping demo with:

- `frontend`: React + Vite UI
- `services/auth`: auth microservice with real DynamoDB session-store support
- `services/catalog`: catalog microservice with real MongoDB Atlas support

## Demo flows

- Login
- Search
- Product details

## Environment setup

1. Install dependencies:
   - `npm install --legacy-peer-deps`
2. Copy env files if needed:
   - `cp frontend/.env.example frontend/.env`
   - `cp services/auth/.env.example services/auth/.env`
   - `cp services/catalog/.env.example services/catalog/.env`

## Database setup

- Auth service:
  - configure `services/auth/.env` with `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `DYNAMODB_TABLE_SESSIONS`
  - create the table with:
    - `bash services/auth/scripts/create-sessions-table.sh`
- Catalog service:
  - configure `services/catalog/.env` with:
    - `MONGODB_DATA_API_BASE_URL`
    - `MONGODB_DATA_API_KEY`
    - `MONGODB_DATA_SOURCE`
    - `MONGODB_DATABASE`
    - `MONGODB_PRODUCTS_COLLECTION`
  - the catalog service seeds the demo products automatically on first successful MongoDB Data API access
- If these variables are not set yet, both services fall back to in-memory mode so the UI can still run locally during setup

## Local development

- Start everything with env-file bootstrapping:
  - `bash scripts/start-local.sh`
- Run all apps:
  - `npm run dev`
- Run apps individually:
  - `npm run dev:frontend`
  - `npm run dev:auth`
  - `npm run dev:catalog`

## Build and lint

- `npm run build`
- `npm run lint`

## Service APIs

- Auth service:
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/session`
  - session storage mode is shown in the service startup log
- Catalog service:
  - `GET /products?keyword=...`
  - `GET /products/:id`
  - catalog storage mode is shown in the service startup log

## Demo credentials

- Email: `demo@cttshop.com`
- Password: `Demo@123`
