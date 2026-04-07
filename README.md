# CTT Shopping Demo

Reduced-scope shopping demo with:

- `frontend`: React + Vite UI
- `services/auth`: lightweight auth microservice
- `services/catalog`: lightweight catalog microservice

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

## Local development

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
- Catalog service:
  - `GET /products?keyword=...`
  - `GET /products/:id`

## Demo credentials

- Email: `demo@cttshop.com`
- Password: `Demo@123`
