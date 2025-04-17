import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    // Make environment variables available to the frontend
    "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
  },
  server: {
    host: true, // Allows access from external devices
  },
});
