FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY src ./src
COPY database ./database
COPY migrations ./migrations
COPY scripts ./scripts
COPY server.js ./

EXPOSE 3001

CMD ["npm", "start"]

