import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function fromPackages(path: string): string {
  return fileURLToPath(new URL(`../packages/${path}`, import.meta.url));
}

const CORE_STYLES = fromPackages("core/src/glass-surface.css");

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        examples: fileURLToPath(new URL("examples.html", import.meta.url)),
        playground: fileURLToPath(new URL("index.html", import.meta.url)),
      },
    },
  },
  plugins: [react(), cloudflare()],
  resolve: {
    alias: [
      {
        find: /^@svidskiy\/glass-surface(-react)?\/style\.css$/,
        replacement: CORE_STYLES,
      },
      {
        find: /^@svidskiy\/glass-surface$/,
        replacement: fromPackages("core/src/index.ts"),
      },
      {
        find: /^@svidskiy\/glass-surface-react$/,
        replacement: fromPackages("react/src/index.ts"),
      },
    ],
  },
});
