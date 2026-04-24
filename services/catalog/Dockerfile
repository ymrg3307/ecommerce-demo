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

# Copy only the necessary code for the catalog service
COPY services/catalog ./services/catalog

# Run the catalog service
ENV HOST=0.0.0.0
EXPOSE 3002
CMD ["npm", "start", "--workspace", "catalog-service"]
