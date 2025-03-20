FROM node:20-alpine AS builder

WORKDIR /app

# Accept build argument for package path
ARG PACKAGE_PATH=services/sample

# Copy the workspace and turbo files from the monorepo root
COPY package.json yarn.lock turbo.json ./
COPY common ./common

# Copy the service package files
COPY ${PACKAGE_PATH}/package.json ./${PACKAGE_PATH}/package.json
COPY ${PACKAGE_PATH}/tsconfig.json ./${PACKAGE_PATH}/tsconfig.json

# Install dependencies using monorepo
RUN yarn install --frozen-lockfile

# Copy the source code and API spec
COPY ${PACKAGE_PATH}/src ./${PACKAGE_PATH}/src
COPY ${PACKAGE_PATH}/api ./${PACKAGE_PATH}/api

# Build using Turborepo
RUN yarn turbo run build --filter=./services/sample...

# Production stage
FROM node:20-alpine

WORKDIR /app

# Accept build argument for package path again
ARG PACKAGE_PATH=services/sample

# Copy package files from the monorepo
COPY package.json yarn.lock ./
COPY ${PACKAGE_PATH}/package.json ./${PACKAGE_PATH}/package.json

# Install production dependencies only
RUN yarn workspaces focus --production ${PACKAGE_PATH}

# Copy built code from builder stage
COPY --from=builder /app/${PACKAGE_PATH}/dist ./${PACKAGE_PATH}/dist
COPY --from=builder /app/${PACKAGE_PATH}/api ./${PACKAGE_PATH}/api

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O- http://localhost:3000/health || exit 1

# Start the service
CMD ["node", "services/sample/dist/index.js"] 