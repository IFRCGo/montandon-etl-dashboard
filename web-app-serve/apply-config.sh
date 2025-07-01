#!/bin/bash -xe

find "$DESTINATION_DIRECTORY" -type f -exec sed -i "s|\<APP_TITLE_PLACEHOLDER\>|$APP_TITLE|g" {} +
# NOTE: We don't need a word boundary at end as we already have a trailing slash
find "$DESTINATION_DIRECTORY" -type f -exec sed -i "s|\<APP_API_ENDPOINT_PLACEHOLDER\>|$APP_GRAPHQL_ENDPOINT|g" {} +
