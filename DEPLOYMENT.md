# Deployment Guide

## Frontend: S3 + CloudFront

1. Create an S3 bucket for static hosting artifacts.
2. Create a CloudFront distribution that points to the S3 bucket.
3. Add GitHub repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_S3_BUCKET`
   - `AWS_CLOUDFRONT_DISTRIBUTION_ID`
   - `VITE_API_BASE_URL`
4. Push to `main` to trigger `.github/workflows/deploy-frontend.yml`.

### Demo-day GUID update

1. Generate a GUID.
2. Update the value in `frontend/src/config/demo.ts`.
3. Commit and push.
4. Refresh the CloudFront URL after the workflow completes.

## Backend: EC2 + Nginx

1. Launch an EC2 instance with Node.js 20 and Nginx installed.
2. Copy the repo to the instance.
3. Create `backend/.env` from `backend/.env.example`.
4. Install dependencies with `npm install --legacy-peer-deps`.
5. Build with `npm run build --workspace backend`.
6. Run the API behind a process manager like `pm2` or `systemd`.
7. Use the sample Nginx config in `infra/nginx/ctt-demo.conf`.

## Database setup

### MongoDB Atlas

Create a cluster and set `MONGODB_URI` plus `MONGODB_DB_NAME`. On first startup the backend:

- creates the `users` and `products` collections if needed
- creates the indexes used by login and search
- inserts the seeded demo user and products if the collections are empty

### DynamoDB

Create the `sessions` and `inventory` tables with the script in `infra/scripts/create-dynamodb-tables.sh`, then seed the inventory items with `infra/scripts/seed-dynamodb-inventory.sh`.
