import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const coreStyles = fileURLToPath(
  import.meta.resolve("@svidskiy/glass-surface/style.css")
);

export default defineConfig({
  attw: {
    excludeEntrypoints: ["./style.css"],
    level: "error",
    profile: "esm-only",
  },

  copy: [{ from: coreStyles, to: "dist" }],
  dts: true,
  entry: "src/index.ts",

  exports: {
    customExports: { "./style.css": "./dist/style.css" },
  },
  platform: "browser",

  publint: { level: "suggestion" },
});
