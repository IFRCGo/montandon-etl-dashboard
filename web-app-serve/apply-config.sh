#!/bin/env bash

set -xe

# Substitute WEB_APP_SERVE_PLACEHOLDER__<VAR> markers with runtime values.
# Based on the base image's default-app-apply-config.sh (which handles ^APP_),
# but hardened: the stock script has no sed-metachar escaping and never resolves
# unfilled markers, so a value with &/|/\ corrupts output and an unset var leaks
# the literal marker into the bundle (visibly so for APP_TITLE, which surfaces as
# `%APP_TITLE%` in index.html).
while IFS='=' read -r KEY VALUE; do
    # Escape sed replacement metacharacters (\, & and the | delimiter) so
    # URLs/tokens containing them substitute literally
    ESCAPED_VALUE=$(printf '%s' "$VALUE" | sed -e 's/[\\&|]/\\&/g')
    find "$DESTINATION_DIRECTORY" -type f \
        -exec sed -i "s|\<WEB_APP_SERVE_PLACEHOLDER__$KEY\>|$ESCAPED_VALUE|g" {} +
done < <(env | grep '^APP_')

# Resolve unfilled placeholders to real JS `undefined` (falsy) instead of
# leaking the literal marker (a truthy string) into the bundle. The
# overrideDefineForWebAppServe emits the marker JSON-stringified (quoted), so
# consuming the surrounding quotes turns `"WEB_APP_SERVE_PLACEHOLDER__APP_X"`
# into a bare `undefined`. Warn about every placeholder we had to blank this way.
# NOTE: the rewrite is quoted-JS-only by design — unquoted markers (e.g. a
# user-visible index.html `%APP_TITLE%` title, CSS) are left in place and only
# surfaced by the warning; the fix for those is a baked default (§3, e.g.
# `ENV APP_TITLE="Montandon ETL Dashboard"`), never a static value shipped as env.
LEFTOVER_PLACEHOLDERS=$(grep -rho 'WEB_APP_SERVE_PLACEHOLDER__APP_[A-Za-z0-9_]*' "$DESTINATION_DIRECTORY" | sort -u)
if [ -n "$LEFTOVER_PLACEHOLDERS" ]; then
    echo "WARNING: no runtime value for the placeholder(s) below — quoted JS occurrences set to 'undefined'; any unquoted occurrence (e.g. index.html) is left in place:" >&2
    printf '%s\n' "$LEFTOVER_PLACEHOLDERS" | sed 's/^/  - /' >&2
fi
find "$DESTINATION_DIRECTORY" -type f \
    -exec sed -i 's|"WEB_APP_SERVE_PLACEHOLDER__APP_[A-Za-z0-9_]*"|undefined|g' {} +
