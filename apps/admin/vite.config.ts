import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Port 5190 keeps clear of the landing page (5173) and Expo (8081/8082).
// The same origin must be listed in the API's CORS_ORIGIN for local development.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5190, strictPort: true },
  preview: { port: 5191, strictPort: true },
});
