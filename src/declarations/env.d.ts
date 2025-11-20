/// <reference types="vite/client" />

type ImportMetaEnvAugmented = import('@julr/vite-plugin-validate-env').ImportMetaEnvAugmented<
  typeof import('../../env').default
>

interface ImportMetaEnv extends ImportMetaEnvAugmented {
    // The custom environment variables that are passed through the vite
    APP_GRAPHQL_ENDPOINT: string,
    APP_GRAPHQL_CODEGEN_ENDPOINT: string,
    APP_TITLE: string,
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
