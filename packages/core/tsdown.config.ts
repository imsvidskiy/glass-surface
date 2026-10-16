import { defineConfig } from "tsdown";

export default defineConfig({
  attw: {
    excludeEntrypoints: ["./style.css"],
    level: "error",
    profile: "esm-only",
  },

  copy: [{ from: "src/glass-surface.css", rename: "style.css", to: "dist" }],
  dts: true,
  entry: "src/index.ts",

  exports: {
    customExports: { "./style.css": "./dist/style.css" },
  },
  platform: "browser",

  publint: { level: "suggestion" },
});
