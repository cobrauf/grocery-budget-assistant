import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Make environment variables available to the frontend
    "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
  },
});
