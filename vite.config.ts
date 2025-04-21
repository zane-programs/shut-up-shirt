import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@client": resolve(__dirname, "./src/client"),
      "@server": resolve(__dirname, "./src/server"),
    },
  },
});
