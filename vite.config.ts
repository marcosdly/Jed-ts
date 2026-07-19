import { defineConfig, type UserConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const isProd = mode === "production";
  return {
    build: {
      lib: {
        name: "jed",
        entry: "src/index.ts",
        formats: ["cjs", "es", "iife", "umd"],
      },
      sourcemap: isDev,
      minify: isProd,
    },
  } satisfies UserConfig;
});
