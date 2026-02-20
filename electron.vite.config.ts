import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@main": resolve("src/main"),
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        "@preload": resolve("src/preload"),
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve("src/renderer/src"),
        "@renderer": resolve("src/renderer/src"),
        "@components": resolve("src/renderer/src/components"),
        "@hooks": resolve("src/renderer/src/hooks"),
        "@lib": resolve("src/renderer/src/lib"),
      },
    },
    plugins: [tailwindcss(), react()],
  },
});
