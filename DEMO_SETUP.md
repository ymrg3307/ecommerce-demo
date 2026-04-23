# Demo Startup & Setup Guide

This guide covers everything you need to start the application and prepare for a demo, including setting up the real persistent databases.

## 1. Prerequisites (Database Credentials)

### Authentication Service (AWS DynamoDB)
You need valid AWS IAM user credentials that have `AmazonDynamoDBFullAccess`.
In `services/auth/.env`, ensure you have the following configured:
```properties
PORT=3001
HOST=127.0.0.1
FRONTEND_ORIGIN=http://localhost:5173
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_TABLE_SESSIONS=ctt-demo-sessions
```

### Catalog Service (MongoDB Atlas)
We have updated the catalog to use the standard MongoDB Node.js driver (the HTTP Data API is deprecated).
In `services/catalog/.env`, ensure you have your cluster's connection string:
```properties
PORT=3002
HOST=127.0.0.1
FRONTEND_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0...
MONGODB_DATABASE=ctt-demo
MONGODB_PRODUCTS_COLLECTION=products
```

## 2. Bootstrapping the Environment

### Create the DynamoDB Session Table
Before starting the application for the first time, you must provision the session table in AWS:
```bash
set -a
source services/auth/.env
set +a
bash services/auth/scripts/create-sessions-table.sh
```

### Seed the MongoDB Database
The MongoDB database is explicitly configured to auto-seed when you fetch the products. You do not need to run a standalone script for this. The very first time you load the UI (which triggers a `GET /products` request), the backend will automatically populate MongoDB with the items from `demo-products.js`.

## 3. Starting the Servers

To start the frontend UI, the Authentication Microservice, and the Catalog Microservice concurrently, simply run the following script from the root directory:

```bash
bash scripts/start-local.sh
```

This will run all workspaces and expose the frontend on **http://localhost:5173/**.

## 4. Running the Demo

1. **Visit the Frontend:** Navigate to `http://localhost:5173/` in your browser. All 4 demo products will load on the page.
2. **Login:** Use the following test credentials to sign in and generate a DynamoDB session:
   - **Email:** `demo@cttshop.com`
   - **Password:** `Demo@123`
3. **Search:** Try searching for terms like "shirt", "jacket", or "rust" in the search bar. The backend catalog service will perform wildcard text searches directly against your MongoDB cluster.
