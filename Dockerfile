FROM node:20-alpine AS builder

# Accept build argument for which package to build
ARG SERVICE_PATH
ARG SERVICE_NAME

WORKDIR /app

# Copy the entire repo for proper workspace resolution
COPY . .

# Install all dependencies and build the specific service
RUN yarn set version 4.7.0 && yarn install && yarn workspace ${SERVICE_NAME} build

# For sample service with API files, copy them to a predictable location
RUN if [ -d "/app/workshop/${SERVICE_PATH}/api" ]; then \
      mkdir -p /app/api-files && \
      cp -r /app/workshop/${SERVICE_PATH}/api/* /app/api-files/; \
    fi

# Production stage - small image with only what's needed
FROM node:20-alpine AS production

ARG SERVICE_PATH
ARG SERVICE_NAME

WORKDIR /app

# Copy package files needed
COPY package.json yarn.lock ./
COPY workshop/${SERVICE_PATH}/package.json ./workshop/${SERVICE_PATH}/
COPY workshop/common/package.json ./workshop/common/

# Install production dependencies
RUN yarn install --production

# Copy built code from builder stage
COPY --from=builder /app/workshop/${SERVICE_PATH}/dist/ ./workshop/${SERVICE_PATH}/dist/
COPY --from=builder /app/workshop/common/dist/ ./workshop/common/dist/

# Create API directory structure 
RUN mkdir -p ./workshop/${SERVICE_PATH}/api

# Copy API files if they exist (for sample service)
COPY --from=builder /app/api-files/ ./workshop/${SERVICE_PATH}/api/
    
# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O- http://localhost:${PORT}/health || exit 1

# Add a flexible start command
CMD ["sh", "-c", "if [ -f ./workshop/${SERVICE_PATH}/dist/index.js ]; then node workshop/${SERVICE_PATH}/dist/index.js; else node workshop/${SERVICE_PATH}/dist/server.js; fi"] 