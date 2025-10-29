// vite.config.ts
import { ValidateEnv as validateEnv } from "file:///code/node_modules/.pnpm/@julr+vite-plugin-validate-env@1.1.1_vite@5.1.5_zod@3.24.1/node_modules/@julr/vite-plugin-validate-env/dist/index.mjs";
import reactSwc from "file:///code/node_modules/.pnpm/@vitejs+plugin-react-swc@3.0.0_vite@5.1.5/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { execSync } from "child_process";
import { defineConfig as defineConfig2 } from "file:///code/node_modules/.pnpm/vite@5.1.5_@types+node@20.1.3/node_modules/vite/dist/node/index.js";
import checker from "file:///code/node_modules/.pnpm/vite-plugin-checker@0.6.0_eslint@8.57.1_stylelint@16.2.1_typescript@5.0.4_vite@5.1.5/node_modules/vite-plugin-checker/dist/esm/main.js";
import { compression } from "file:///code/node_modules/.pnpm/vite-plugin-compression2@1.0.0/node_modules/vite-plugin-compression2/dist/index.mjs";
import svgr from "file:///code/node_modules/.pnpm/vite-plugin-svgr@4.2.0_typescript@5.0.4_vite@5.1.5/node_modules/vite-plugin-svgr/dist/index.js";
import webfontDownload from "file:///code/node_modules/.pnpm/vite-plugin-webfont-dl@3.7.4_vite@5.1.5/node_modules/vite-plugin-webfont-dl/dist/index.mjs";
import tsconfigPaths from "file:///code/node_modules/.pnpm/vite-tsconfig-paths@4.2.0_typescript@5.0.4_vite@5.1.5/node_modules/vite-tsconfig-paths/dist/index.mjs";

// env.ts
import {
  defineConfig,
  Schema
} from "file:///code/node_modules/.pnpm/@julr+vite-plugin-validate-env@1.1.1_vite@5.1.5_zod@3.24.1/node_modules/@julr/vite-plugin-validate-env/dist/index.mjs";
var env_default = defineConfig({
  APP_GRAPHQL_ENDPOINT: Schema.string.optional(),
  APP_TITLE: Schema.string.optional()
});

// vite.config.ts
var commitHash = execSync("git rev-parse --short HEAD").toString();
var vite_config_default = defineConfig2(({ mode }) => {
  const isProd = mode === "production";
  return {
    define: {
      APP_COMMIT_HASH: JSON.stringify(commitHash)
    },
    plugins: [
      isProd ? checker({
        typescript: true,
        eslint: {
          lintCommand: "eslint ./src"
        },
        stylelint: {
          lintCommand: 'stylelint "./src/**/*.css"'
        }
      }) : void 0,
      svgr(),
      reactSwc(),
      tsconfigPaths(),
      webfontDownload(),
      validateEnv(env_default),
      isProd ? compression() : void 0
    ],
    css: {
      devSourcemap: isProd,
      modules: {
        scopeBehaviour: "local",
        localsConvention: "camelCaseOnly"
      }
    },
    envPrefix: "APP_",
    server: {
      port: 3091,
      host: true,
      strictPort: true
    },
    build: {
      outDir: "build",
      sourcemap: isProd
    },
    test: {
      environment: "happy-dom"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiZW52LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2NvZGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9jb2RlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9jb2RlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgVmFsaWRhdGVFbnYgYXMgdmFsaWRhdGVFbnYgfSBmcm9tICdAanVsci92aXRlLXBsdWdpbi12YWxpZGF0ZS1lbnYnO1xuaW1wb3J0IHJlYWN0U3djIGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgY2hlY2tlciBmcm9tICd2aXRlLXBsdWdpbi1jaGVja2VyJztcbmltcG9ydCB7IGNvbXByZXNzaW9uIH0gZnJvbSAndml0ZS1wbHVnaW4tY29tcHJlc3Npb24yJztcbmltcG9ydCBzdmdyIGZyb20gJ3ZpdGUtcGx1Z2luLXN2Z3InO1xuaW1wb3J0IHdlYmZvbnREb3dubG9hZCBmcm9tICd2aXRlLXBsdWdpbi13ZWJmb250LWRsJztcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xuXG5pbXBvcnQgZW52Q29uZmlnIGZyb20gJy4vZW52JztcblxuLyogR2V0IGNvbW1pdCBoYXNoICovXG5jb25zdCBjb21taXRIYXNoID0gZXhlY1N5bmMoJ2dpdCByZXYtcGFyc2UgLS1zaG9ydCBIRUFEJykudG9TdHJpbmcoKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICAgIGNvbnN0IGlzUHJvZCA9IG1vZGUgPT09ICdwcm9kdWN0aW9uJztcbiAgICByZXR1cm4ge1xuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICAgIEFQUF9DT01NSVRfSEFTSDogSlNPTi5zdHJpbmdpZnkoY29tbWl0SGFzaCksXG4gICAgICAgIH0sXG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAgIGlzUHJvZCA/IGNoZWNrZXIoe1xuICAgICAgICAgICAgICAgIHR5cGVzY3JpcHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgZXNsaW50OiB7XG4gICAgICAgICAgICAgICAgICAgIGxpbnRDb21tYW5kOiAnZXNsaW50IC4vc3JjJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0eWxlbGludDoge1xuICAgICAgICAgICAgICAgICAgICBsaW50Q29tbWFuZDogJ3N0eWxlbGludCBcIi4vc3JjLyoqLyouY3NzXCInLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHN2Z3IoKSxcbiAgICAgICAgICAgIHJlYWN0U3djKCksXG4gICAgICAgICAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgICAgICAgICB3ZWJmb250RG93bmxvYWQoKSxcbiAgICAgICAgICAgIHZhbGlkYXRlRW52KGVudkNvbmZpZyksXG4gICAgICAgICAgICBpc1Byb2QgPyBjb21wcmVzc2lvbigpIDogdW5kZWZpbmVkLFxuICAgICAgICBdLFxuICAgICAgICBjc3M6IHtcbiAgICAgICAgICAgIGRldlNvdXJjZW1hcDogaXNQcm9kLFxuICAgICAgICAgICAgbW9kdWxlczoge1xuICAgICAgICAgICAgICAgIHNjb3BlQmVoYXZpb3VyOiAnbG9jYWwnLFxuICAgICAgICAgICAgICAgIGxvY2Fsc0NvbnZlbnRpb246ICdjYW1lbENhc2VPbmx5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGVudlByZWZpeDogJ0FQUF8nLFxuICAgICAgICBzZXJ2ZXI6IHtcbiAgICAgICAgICAgIHBvcnQ6IDMwOTEsXG4gICAgICAgICAgICBob3N0OiB0cnVlLFxuICAgICAgICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIG91dERpcjogJ2J1aWxkJyxcbiAgICAgICAgICAgIHNvdXJjZW1hcDogaXNQcm9kLFxuICAgICAgICB9LFxuICAgICAgICB0ZXN0OiB7XG4gICAgICAgICAgICBlbnZpcm9ubWVudDogJ2hhcHB5LWRvbScsXG4gICAgICAgIH0sXG4gICAgfTtcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvY29kZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2NvZGUvZW52LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9jb2RlL2Vudi50c1wiO2ltcG9ydCB7XG4gICAgZGVmaW5lQ29uZmlnLFxuICAgIFNjaGVtYSxcbn0gZnJvbSAnQGp1bHIvdml0ZS1wbHVnaW4tdmFsaWRhdGUtZW52JztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBBUFBfR1JBUEhRTF9FTkRQT0lOVDogU2NoZW1hLnN0cmluZy5vcHRpb25hbCgpLFxuICAgIEFQUF9USVRMRTogU2NoZW1hLnN0cmluZy5vcHRpb25hbCgpLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlNLFNBQVMsZUFBZSxtQkFBbUI7QUFDNU8sT0FBTyxjQUFjO0FBQ3JCLFNBQVMsZ0JBQWdCO0FBQ3pCLFNBQVMsZ0JBQUFBLHFCQUFvQjtBQUM3QixPQUFPLGFBQWE7QUFDcEIsU0FBUyxtQkFBbUI7QUFDNUIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8scUJBQXFCO0FBQzVCLE9BQU8sbUJBQW1COzs7QUNSdUo7QUFBQSxFQUM3SztBQUFBLEVBQ0E7QUFBQSxPQUNHO0FBRVAsSUFBTyxjQUFRLGFBQWE7QUFBQSxFQUN4QixzQkFBc0IsT0FBTyxPQUFPLFNBQVM7QUFBQSxFQUM3QyxXQUFXLE9BQU8sT0FBTyxTQUFTO0FBQ3RDLENBQUM7OztBREtELElBQU0sYUFBYSxTQUFTLDRCQUE0QixFQUFFLFNBQVM7QUFFbkUsSUFBTyxzQkFBUUMsY0FBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3RDLFFBQU0sU0FBUyxTQUFTO0FBQ3hCLFNBQU87QUFBQSxJQUNILFFBQVE7QUFBQSxNQUNKLGlCQUFpQixLQUFLLFVBQVUsVUFBVTtBQUFBLElBQzlDO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDTCxTQUFTLFFBQVE7QUFBQSxRQUNiLFlBQVk7QUFBQSxRQUNaLFFBQVE7QUFBQSxVQUNKLGFBQWE7QUFBQSxRQUNqQjtBQUFBLFFBQ0EsV0FBVztBQUFBLFVBQ1AsYUFBYTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixDQUFDLElBQUk7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLFNBQVM7QUFBQSxNQUNULGNBQWM7QUFBQSxNQUNkLGdCQUFnQjtBQUFBLE1BQ2hCLFlBQVksV0FBUztBQUFBLE1BQ3JCLFNBQVMsWUFBWSxJQUFJO0FBQUEsSUFDN0I7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNELGNBQWM7QUFBQSxNQUNkLFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFFBQ2hCLGtCQUFrQjtBQUFBLE1BQ3RCO0FBQUEsSUFDSjtBQUFBLElBQ0EsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sWUFBWTtBQUFBLElBQ2hCO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDSCxRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsSUFDZjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0YsYUFBYTtBQUFBLElBQ2pCO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbImRlZmluZUNvbmZpZyIsICJkZWZpbmVDb25maWciXQp9Cg==
