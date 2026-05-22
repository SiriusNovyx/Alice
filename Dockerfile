FROM node:24 AS build

ARG COMMIT_HASH
ARG BUILD_TIME

RUN mkdir /alice
RUN chown node:node /alice

# Install pnpm
RUN npm install -g pnpm@10.19.0

USER node

# Install dependencies before copying over any other files
COPY --chown=node:node package.json pnpm-workspace.yaml pnpm-lock.yaml /alice
RUN mkdir /alice/backend
COPY --chown=node:node backend/package.json /alice/backend
RUN mkdir /alice/shared
COPY --chown=node:node shared/package.json /alice/shared
RUN mkdir /alice/dashboard
COPY --chown=node:node dashboard/package.json /alice/dashboard

WORKDIR /alice
RUN CI=true pnpm install

COPY --chown=node:node . /alice

# Build backend
WORKDIR /alice/backend
RUN pnpm run build

# Build dashboard
WORKDIR /alice/dashboard
RUN pnpm run build

# Only keep prod dependencies
WORKDIR /alice
RUN CI=true pnpm install --prod

# Add version info
RUN echo "${COMMIT_HASH}" > /alice/.commit-hash
RUN echo "${BUILD_TIME}" > /alice/.build-time

# --- Main image ---

FROM node:24-alpine AS main

RUN npm install -g pnpm@10.19.0

USER node
COPY --from=build --chown=node:node /alice /alice

WORKDIR /alice
