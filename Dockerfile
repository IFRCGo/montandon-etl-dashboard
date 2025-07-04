# -------------------------- Dev ---------------------------------------

FROM node:18-bullseye AS dev

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        git bash g++ make \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /code

RUN git config --global --add safe.directory /code

# -------------------------- Nginx - Builder -----------------------
FROM dev AS nginx-build

COPY ./package.json ./pnpm-lock.yaml /code/

RUN corepack prepare --activate

RUN pnpm install

COPY . .

## Build variables (Requires backend pulled)
ENV APP_TITLE=APP_TITLE_PLACEHOLDER
ENV APP_GRAPHQL_ENDPOINT=APP_API_ENDPOINT_PLACEHOLDER

ENV APP_GRAPHQL_CODEGEN_ENDPOINT=./montandon-etl/schema.graphql

RUN pnpm generate:type && pnpm build

# ---------------------------Nginx - Serve----------------------------------
FROM ghcr.io/toggle-corp/web-app-serve:v0.1.1 AS web-app-serve

LABEL maintainer="IFRC"
LABEL org.opencontainers.image.source="https://github.com/IFRCGo/montandon-etl-dashboard"

# NOTE: Used by apply-config.sh
ENV APPLY_CONFIG__APPLY_CONFIG_PATH=/code/apply-config.sh
ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/

COPY --from=nginx-build /code/build "$APPLY_CONFIG__SOURCE_DIRECTORY"
COPY ./web-app-serve/apply-config.sh "$APPLY_CONFIG__APPLY_CONFIG_PATH"
