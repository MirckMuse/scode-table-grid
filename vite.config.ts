import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
  base: "./",

  plugins: [
    vue({
      include: [
        "src/**/*.vue",
        "example/vue/**/*.vue",
        "packages/table-grid-vue/**/*.vue",
      ],
    }),
    react({
      include: "example/react",
    }),
  ],

  resolve: {
    alias: {
      "@scode/table-grid-core": resolve(__dirname, "packages/table-grid-core/src/index.ts")
    }
  },

  server: {
    port: 4001,
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        vue: resolve(__dirname, "example/vue/index.html"),
        react: resolve(__dirname, "example/react/index.html"),
      },
    },
  },
});
