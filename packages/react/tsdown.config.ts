import { defineConfig } from "tsdown";

export default defineConfig({
  attw: {
    excludeEntrypoints: [
      "./style.css",
    ],
    level: "error",
  },
  copy: [
    {
      from: "../core/src/glass-surface.css",
      rename: "style.css",
      to: "dist",
    },
  ],
  exports: {
    customExports: {
      "./style.css": "./dist/style.css",
    },
  },
  platform: "browser",
  publint: true,
  target: "es2023",
});
