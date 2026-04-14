FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --production

# Copy entire backend directory
COPY backend/src ./src
COPY backend/database ./database
COPY backend/migrations ./migrations
COPY backend/scripts ./scripts
COPY backend/server.js ./
COPY backend/.env.production ./.env

EXPOSE 3001

CMD ["node", "server.js"]
