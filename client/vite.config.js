import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1500, // Safe for map + realtime apps

    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          react: ["react", "react-dom"],

          // Maps (heavy libraries)
          maps: ["leaflet", "react-leaflet"],

          // Realtime communication
          socket: ["socket.io-client"],

          // Icons / UI
          ui: ["lucide-react"],
        },
      },
    },
  },
});
