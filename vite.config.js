import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/mg69-street-luxury/",
  plugins: [react()],
  build: {
    outDir: "docs",
    emptyOutDir: true
  }
});
