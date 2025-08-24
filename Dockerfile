FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci --only=production

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

COPY scripts/health-check.js ./dist/

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node /app/dist/health-check.js

CMD ["npm", "start"]
