FROM node:20-alpine

# Define build argument for port with a default value
ARG PORT=3000

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=${PORT}

# Expose port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O- http://localhost:${PORT}/health || exit 1

# Start the service
CMD ["node", "dist/server.js"]
