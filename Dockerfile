# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Use package.json only so we don't rely on a pruned lockfile
COPY package.json ./
RUN npm install --include=dev --no-fund --no-audit

# Now bring in the source and build (vite/esbuild are available)
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# copy built artifacts and only prod deps for runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
RUN npm install --omit=dev --no-fund --no-audit

ENV PORT=8080
EXPOSE 8080
CMD ["node","dist/index.js"]
