import {
    defineConfig,
    Schema,
} from '@julr/vite-plugin-validate-env';

export default defineConfig({
    APP_GRAPHQL_ENDPOINT: Schema.string.optional(),
    APP_TITLE: Schema.string.optional(),
});
