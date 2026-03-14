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
ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_CHATBOT_API_URL
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_CHATBOT_API_URL=$NEXT_PUBLIC_CHATBOT_API_URL
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"
ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_CHATBOT_API_URL
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_CHATBOT_API_URL=$NEXT_PUBLIC_CHATBOT_API_URL
ENV BACKEND_HOST=backend

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

# Create startup script with health check for Next.js
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo 'cd /app' >> /start.sh && \
    echo 'echo "Starting Next.js server..."' >> /start.sh && \
    echo 'chown -R nextjs:nodejs /app' >> /start.sh && \
    echo 'runuser -u nextjs -- node server.js &' >> /start.sh && \
    echo 'NEXTJS_PID=$!' >> /start.sh && \
    echo 'echo "Waiting for Next.js to be ready on port 3001..."' >> /start.sh && \
    echo 'for i in 1 2 3 4 5 6 7 8 9 10; do' >> /start.sh && \
    echo '  if nc -z 127.0.0.1 3001 2>/dev/null; then' >> /start.sh && \
    echo '    echo "Next.js is ready!"' >> /start.sh && \
    echo '    break' >> /start.sh && \
    echo '  fi' >> /start.sh && \
    echo '  sleep 1' >> /start.sh && \
    echo 'done' >> /start.sh && \
    echo 'echo "Starting Nginx..."' >> /start.sh && \
    echo 'trap "kill -TERM $NEXTJS_PID; wait $NEXTJS_PID" TERM INT' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Install netcat for health check and util-linux for runuser
RUN apk add --no-cache netcat-openbsd util-linux

# Expose port 80
EXPOSE 80

# Start services
CMD ["/start.sh"]
