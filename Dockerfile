# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dev deps (vite, esbuild, tsx, etc.) for building
COPY package*.json ./
# force dev deps in CI (some envs set production=true)
RUN npm ci --include=dev --no-fund --no-audit

# build the app
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# copy built artifacts and only install prod deps
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev --no-fund --no-audit

# Cloud Run listens on $PORT
ENV PORT=8080
EXPOSE 8080
CMD ["node","dist/index.js"]
