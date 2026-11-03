import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function fromPackages(path: string): string {
  return fileURLToPath(new URL(`../packages/${path}`, import.meta.url));
}

const CORE_STYLES = fromPackages("core/src/glass-surface.css");

export default defineConfig({
  plugins: [react(), cloudflare()],
  resolve: {
    alias: [
      {
        find: /^@imsvidskiy\/glass-surface(?:-react)?\/style\.css$/u,
        replacement: CORE_STYLES,
      },
      {
        find: /^@imsvidskiy\/glass-surface$/u,
        replacement: fromPackages("core/src/index.ts"),
      },
      {
        find: /^@imsvidskiy\/glass-surface-react$/u,
        replacement: fromPackages("react/src/index.ts"),
      },
    ],
  },
});
