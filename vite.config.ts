import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  server: {
    port: 24125,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:7895',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:7895',
        ws: true,
      },
    },
  },
  preview: {
    port: 24125,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
