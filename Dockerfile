# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
# copy lock + package so install is cached
COPY package*.json ./
RUN npm ci
COPY . .
# repo build uses vite + esbuild -> outputs into dist
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# copy built artifacts
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
# install only production deps
RUN npm ci --omit=dev
# Cloud Run uses PORT env; default 8080 fallback
ENV PORT=8080
EXPOSE 8080
# start the built server
CMD ["node","dist/index.js"]
