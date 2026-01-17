# Build stage - Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Build stage - Next.js build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

# Install Nginx
RUN apk add --no-cache nginx

# Create non-root user for Next.js
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Nginx configuration files
# Replace main nginx.conf to ensure proper structure
COPY nginx-main.conf /etc/nginx/nginx.conf

# Remove default server config and copy ours
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ensure nginx can read the configs
RUN chmod 644 /etc/nginx/nginx.conf && \
    chmod 644 /etc/nginx/conf.d/default.conf

# Test nginx config (will fail build if config is invalid)
RUN nginx -t

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo 'cd /app' >> /start.sh && \
    echo 'su-exec nextjs node server.js &' >> /start.sh && \
    echo 'NGINX_PID=$$' >> /start.sh && \
    echo 'trap "kill -TERM $$NGINX_PID; wait $$NGINX_PID" TERM INT' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Install su-exec for running as non-root user
RUN apk add --no-cache su-exec

# Expose port 80
EXPOSE 80

# Start services
CMD ["/start.sh"]
