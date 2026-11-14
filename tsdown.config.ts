import { defineConfig } from "tsdown";

export default defineConfig({
  attw: {
    excludeEntrypoints: [
      "./style.css",
    ],
    level: "error",
  },
  copy: "../core/src/style.css",
  entry: "src/index.ts",
  platform: "browser",
  publint: true,
  target: "es2023",
  workspace: "packages/*",
});
