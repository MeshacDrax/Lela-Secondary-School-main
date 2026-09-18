FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock*.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install

COPY tsconfig.base.json ./
COPY apps/api apps/api
COPY packages/shared packages/shared

RUN npm --workspace @lela/api run build

EXPOSE 4000
CMD ["npm", "--workspace", "@lela/api", "run", "start"]
