FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json tsconfig.json ./
RUN yarn install

# Copy application code
COPY src/ ./src

# Build TypeScript
RUN yarn build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Run the service
CMD ["node", "dist/server.js"]