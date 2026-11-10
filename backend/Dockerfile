# Build: install everything from the lockfile, compile, then drop the devDependencies.
FROM --platform=linux/amd64 node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev && npm cache clean --force

# Runtime: only the compiled app and its production dependencies, run as the unprivileged `node` user.
FROM --platform=linux/amd64 node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

USER node

# The same image runs the one-off tasks, e.g. `npm run migration:run:prod` (docs/deploy-production.md).
CMD ["node", "dist/main"]
