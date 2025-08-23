FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port (if needed for health checks)
EXPOSE 3000

# Health check script
COPY scripts/health-check.js ./dist/

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node /app/dist/health-check.js

# Start the application
CMD ["npm", "start"]
