# Multi-stage build for Railway deployment
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY server/ ./server/
COPY server.js ./

# Build stage for frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy frontend package files
COPY client/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY client/ ./client/

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY server/ ./server/
COPY server.js ./

# Copy built frontend from frontend-build stage
COPY --from=frontend-build /app/client/build ./client/build

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server.js"]