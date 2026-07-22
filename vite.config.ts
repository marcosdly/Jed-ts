import { defineConfig, type PluginOption, type UserConfig } from "vite";

function pluginPreserveGeneratedModule(name: string): PluginOption {
  const END_STATEMENT = ";";
  return {
    name: "preserve-generated-module",
    enforce: "pre",
    transform(rawCodeString, filePath) {
      if (filePath.endsWith(`${name}.js`)) {
        return {
          code: rawCodeString.concat(
            END_STATEMENT,
            `window.${name} = ${name}`,
            END_STATEMENT,
          ),
        };
      }
    },
  } satisfies PluginOption;
}

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const isProd = mode === "production";
  return {
    plugins: [pluginPreserveGeneratedModule("lib_plurals_parser")],
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
