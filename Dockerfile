# -------------------------- Dev ---------------------------------------

# NOTE: Node 20+ is required — @togglecorp/vite-plugin-validate-env (v2) uses a
# `v`-flag (unicodeSets) regex when loading the Vite config, which Node 18 cannot
# parse ("Invalid regular expression flags"). CI (ci.yml) already runs Node 20.
FROM node:20-bookworm AS dev

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        git bash g++ make \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /code

RUN git config --global --add safe.directory /code

# -------------------------- web-app-serve - Builder -----------------------
FROM dev AS web-app-serve-build

COPY ./package.json ./pnpm-lock.yaml /code/

RUN corepack prepare --activate

RUN pnpm install

COPY . .

# These env variables can be dynamically defined in the web-app-serve container.
# Set a valid-but-dummy value for every dynamic var here; env.ts only needs it to
# pass schema validation — the actual value is emitted as a runtime placeholder
# marker (overrideDefineForWebAppServe) and substituted at container start.
ENV APP_GRAPHQL_ENDPOINT=https://web-app-serve-placeholder.com/graphql/
# NOTE: APP_TITLE is also consumed at build time by Vite's `%APP_TITLE%` HTML
# replacement (index.html <title>/noscript). Use the raw web-app-serve placeholder
# marker as the build value so index.html carries a runtime slot that apply-config
# fills at container start.
ENV APP_TITLE=WEB_APP_SERVE_PLACEHOLDER__APP_TITLE

# Codegen reads the GraphQL schema from the montandon-etl submodule at build time.
ENV APP_GRAPHQL_CODEGEN_ENDPOINT=./montandon-etl/schema.graphql

RUN WEB_APP_SERVE_ENABLED=true pnpm build

# ---------------------------Final image using web-app-serve----------------------------------
FROM ghcr.io/toggle-corp/web-app-serve:v0.1.2 AS web-app-serve

LABEL maintainer="IFRC"
LABEL org.opencontainers.image.source="https://github.com/IFRCGo/montandon-etl-dashboard"

# Env for apply-config script (base image only presets DESTINATION_DIRECTORY)
ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/

COPY --from=web-app-serve-build /code/build "$APPLY_CONFIG__SOURCE_DIRECTORY"

# Ship a hardened custom apply-config (grep ^APP_) instead of the base image's
# stock default-app-apply-config.sh. The stock script only substitutes vars that
# are SET and never blanks unfilled markers, so an unset var leaked the literal
# WEB_APP_SERVE_PLACEHOLDER__* marker into the bundle — visibly so for APP_TITLE,
# which appears as `%APP_TITLE%` in index.html (<title>, noscript). Our script
# escapes sed metachars (values with &/|/\ substitute literally, no crash) and
# blanks unfilled placeholders to "" (restores the old nginx-serve semantics:
# unset == empty/falsy). See ./web-app-serve/apply-config.sh.
COPY ./web-app-serve/apply-config.sh /web-app-serve/app-apply-config.sh
RUN chmod +x /web-app-serve/app-apply-config.sh
ENV APPLY_CONFIG__APPLY_CONFIG_PATH=/web-app-serve/app-apply-config.sh

# NOTE: APP_TITLE is a default (overridable) var — it has a sensible shared
# default ("Montandon ETL Dashboard") but stays runtime-overridable. Bake the
# default as an ENV here in the final stage; apply-config substitutes it at
# startup like any other var, so deployments need not set it, yet can override
# it. (The build stage sets APP_TITLE to the raw placeholder marker so index.html
# carries a runtime slot.)
ENV APP_TITLE="Montandon ETL Dashboard"
