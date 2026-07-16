import {
    defineConfig,
    overrideDefineForWebAppServe,
    Schema,
} from '@togglecorp/vite-plugin-validate-env';

const webAppServeEnabled = process.env.WEB_APP_SERVE_ENABLED?.toLowerCase() === 'true';
if (webAppServeEnabled) {
    // eslint-disable-next-line no-console
    console.warn('Building application for web-app-serve');
}
const overrideDefine = webAppServeEnabled
    ? overrideDefineForWebAppServe
    : undefined;

export default defineConfig({
    overrideDefine,
    validator: 'builtin',
    schema: {
        APP_GRAPHQL_ENDPOINT: Schema.string({ format: 'url', protocol: true, tld: false }),
        // NOTE: APP_TITLE is consumed at build time by Vite's `%APP_TITLE%` HTML
        // replacement (index.html <title>/noscript). It is a default (overridable)
        // var — the shared default is baked as an ENV in the Dockerfile final stage,
        // yet stays runtime-overridable via web-app-serve.
        APP_TITLE: Schema.string(),
    },
});
