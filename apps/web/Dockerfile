FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock*.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install

COPY tsconfig.base.json ./
COPY apps/web apps/web
COPY packages/shared packages/shared

ARG VITE_API_BASE_URL=http://localhost:4000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm --workspace @lela/web run build

EXPOSE 4173
CMD ["npm", "--workspace", "@lela/web", "run", "preview"]
