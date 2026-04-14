FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY backend/src ./src
COPY backend/database ./database
COPY backend/migrations ./migrations
COPY backend/scripts ./scripts
COPY backend/server.js ./

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3001) + '/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3001

CMD ["npm", "start"]
