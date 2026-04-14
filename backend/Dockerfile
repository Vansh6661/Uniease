FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application code
COPY src ./src
COPY database ./database
COPY migrations ./migrations
COPY scripts ./scripts
COPY server.js ./

EXPOSE 3001

CMD ["node", "server.js"]


