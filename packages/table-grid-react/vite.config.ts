import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    lib: {
      entry: join(fileURLToPath(dirname(import.meta.url)), "./src/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
    outDir: "./esm",
  },
  plugins: [react()],
});
