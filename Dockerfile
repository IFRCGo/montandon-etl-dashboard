# -------------------------- Dev ---------------------------------------

FROM node:20-bookworm AS dev

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        git bash g++ make \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@10.6.1 --force \
    && git config --global --add safe.directory /code

WORKDIR /code

# -------------------------- web-app-serve- Builder --------------------------------
FROM dev AS web-app-serve-build

COPY ./package.json ./pnpm-lock.yaml /code/

RUN pnpm install

COPY . .

## Build variables (Requires backend pulled)
ENV APP_TITLE="Montandon Dashboard"
ENV APP_GRAPHQL_ENDPOINT=http://localhost:8000/graphql/
ENV APP_GRAPHQL_CODEGEN_ENDPOINT=./montandon-etl/schema.graphql

ENV EMDAT_AUTHORIZATION_KEY=this-is-key
ENV IDMC_CLIENT_ID=this-is-client-id
ENV GFD_CREDENTIAL=secret-credential
ENV GFD_SERVICE_ACCOUNT=top-secret@example.com
ENV IFRC_DATA_URL=https://any-url.org
ENV EOAPI_DOMAIN=https://any-url.com
ENV PDC_BASE_URL=https://any-url.org
ENV SENTRY_MONITOR_CELERY_BEAT_TASKS=true


ENV PDC_SENTRY_AUTHORIZATION_KEY=this-is-top-secret
ENV PDC_ARCGIS_USERNAME=any-username
ENV PDC_ARCGIS_PASSWORD=top-secret
ENV GEOCODER_URL=http://any-url.org
ENV DESINVENTAR_DATA_URL=https://www.any-url.net
ENV GLIDE_START_DATE=1980-01-01
ENV IFRCEVENT_START_DATE=1989-01-01
ENV GDACS_START_DATE=1989-01-01
ENV EMDAT_START_YEAR=1980
ENV IBTRACS_DATA_URL=https://any-url.org

RUN pnpm generate:type && WEB_APP_SERVE_ENABLED=true pnpm build

# ---------------------------------------------------------------------
# Final image using web-app-serve

FROM ghcr.io/toggle-corp/web-app-serve:v0.1.2 AS web-app-serve

LABEL org.opencontainers.image.source="https://github.com/IFRCGo/montandon-etl-dashboard"
LABEL org.opencontainers.image.authors="dev@togglecorp.com"

# Env for apply-config script
ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/

COPY --from=web-app-serve-build /code/build "$APPLY_CONFIG__SOURCE_DIRECTORY"
