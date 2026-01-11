# Use the official Node.js runtime as base image
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
FROM base AS deps
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments
ARG NEXT_PUBLIC_N8N_WEBHOOK_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ARG N8N_CALLBACK_SECRET
ARG NEXT_PUBLIC_TINA_CLIENT_ID
ARG NEXT_PUBLIC_TINA_BRANCH
ARG PERPLEXITY_API_KEY
ARG PERPLEXITY_API_URL
ARG PERPLEXITY_MODEL

# Set environment variables for build (must be set before RUN commands)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_N8N_WEBHOOK_URL=${NEXT_PUBLIC_N8N_WEBHOOK_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENV N8N_CALLBACK_SECRET=${N8N_CALLBACK_SECRET}
ENV NEXT_PUBLIC_TINA_CLIENT_ID=${NEXT_PUBLIC_TINA_CLIENT_ID}
ENV NEXT_PUBLIC_TINA_BRANCH=${NEXT_PUBLIC_TINA_BRANCH}
ENV PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
ENV PERPLEXITY_API_URL=${PERPLEXITY_API_URL}
ENV PERPLEXITY_MODEL=${PERPLEXITY_MODEL}

# Validate required build arguments (fail fast if missing)
# Only NEXT_PUBLIC_N8N_WEBHOOK_URL is required for basic flow
RUN if [ -z "$NEXT_PUBLIC_N8N_WEBHOOK_URL" ] || [ "$NEXT_PUBLIC_N8N_WEBHOOK_URL" = "" ]; then \
      echo "ERROR: NEXT_PUBLIC_N8N_WEBHOOK_URL build arg is required but not set" && exit 1; \
    fi
# Note: Supabase vars are optional - storage defaults to file-based unless USE_SUPABASE=true

# Build Next.js application
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install Chrome/Chromium and dependencies for Puppeteer
# Note: Installing as root before switching to non-root user
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Create symlink for chromium-browser (Puppeteer expects this name)
# Alpine's chromium package installs to /usr/bin/chromium
RUN ln -s /usr/bin/chromium /usr/bin/chromium-browser || true

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Allow nextjs user to run chromium (needed for Puppeteer)
# Note: Chromium needs to run as non-root, so we grant access
RUN chmod 755 /usr/bin/chromium-browser

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]

