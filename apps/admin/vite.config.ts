import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8")) as { version: string };

// Port 5190 keeps clear of the landing page (5173) and Expo (8081/8082).
// The same origin must be listed in the API's CORS_ORIGIN for local development.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Read once at build time so the footer can show the app version without importing package.json at runtime.
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: { port: 5190, strictPort: true },
  preview: { port: 5191, strictPort: true },
});
