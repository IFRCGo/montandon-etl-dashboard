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
ENV APP_TITLE=APP_TITLE
ENV APP_GRAPHQL_ENDPOINT=https://APP_GRAPHQL_ENDPOINT.COM/
ENV APP_GRAPHQL_CODEGEN_ENDPOINT=./montandon-etl/schema.graphql

RUN pnpm generate:type && pnpm build

# ---------------------------Nginx - Serve----------------------------------
FROM nginx:1 AS nginx-serve

LABEL maintainer="IFRC"
LABEL org.opencontainers.image.source="https://github.com/IFRCGo/montandon-etl-dashboard"

COPY ./nginx-serve/apply-config.sh /docker-entrypoint.d/
COPY ./nginx-serve/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=nginx-build /code/build /code/build

# NOTE: Used by apply-config.sh
ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/
ENV APPLY_CONFIG__DESTINATION_DIRECTORY=/usr/share/nginx/html/
ENV APPLY_CONFIG__OVERWRITE_DESTINATION=true
