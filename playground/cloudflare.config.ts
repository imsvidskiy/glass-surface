import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    assets: {
      notFoundHandling: "single-page-application",
    },
    compatibilityDate: "2026-09-25",
    name: "glass-surface",
  },
});
