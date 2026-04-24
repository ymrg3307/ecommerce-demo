FROM node:20-alpine

WORKDIR /app

# Copy the root metadata
COPY package.json package-lock.json ./

# Copy all workspace package files to properly run 'npm ci'
COPY frontend/package.json ./frontend/
COPY services/auth/package.json ./services/auth/
COPY services/catalog/package.json ./services/catalog/

# Install dependencies (workspaces supported automatically)
RUN npm ci --omit=dev

# Copy only the necessary code for the authorization service
COPY services/auth ./services/auth

# Run the auth service
ENV HOST=0.0.0.0
EXPOSE 3001
CMD ["npm", "start", "--workspace", "auth-service"]
