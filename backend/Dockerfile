FROM node:18-alpine

WORKDIR /app

# Copy backend package files (from root context, backend/ is included)
COPY ./backend/package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application code (from root context)
COPY ./backend/src ./src
COPY ./backend/database ./database
COPY ./backend/migrations ./migrations
COPY ./backend/scripts ./scripts
COPY ./backend/server.js ./

EXPOSE 3001

CMD ["node", "server.js"]


