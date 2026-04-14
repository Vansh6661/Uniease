FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy entire backend directory
COPY src ./src
COPY database ./database
COPY migrations ./migrations
COPY scripts ./scripts
COPY server.js ./
COPY .env.production ./.env

EXPOSE 3001

CMD ["node", "server.js"]
