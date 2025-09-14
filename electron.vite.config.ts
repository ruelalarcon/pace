import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/main/index.js"),
          "window-manager": resolve(
            __dirname,
            "electron/main/window-manager.js",
          ),
          "ipc-handlers": resolve(__dirname, "electron/main/ipc-handlers.js"),
          "server/index": resolve(__dirname, "electron/server/index.js"),
          "server/routes/projects": resolve(
            __dirname,
            "electron/server/routes/projects.js",
          ),
          "server/routes/files": resolve(
            __dirname,
            "electron/server/routes/files.js",
          ),
          "server/routes/export": resolve(
            __dirname,
            "electron/server/routes/export.js",
          ),
          "server/middleware/cors": resolve(
            __dirname,
            "electron/server/middleware/cors.js",
          ),
          "server/middleware/upload": resolve(
            __dirname,
            "electron/server/middleware/upload.js",
          ),
          "server/utils/file-utils": resolve(
            __dirname,
            "electron/server/utils/file-utils.js",
          ),
          "server/utils/mime-types": resolve(
            __dirname,
            "electron/server/utils/mime-types.js",
          ),
        },
        external: [
          // Keep Node.js built-in modules external
          "electron",
          "path",
          "fs",
          "express",
          "cors",
          "multer",
        ],
        output: {
          format: "cjs",
          entryFileNames: (chunkInfo) => {
            // Preserve directory structure for server modules
            if (chunkInfo.name.startsWith("server/")) {
              return `${chunkInfo.name}.js`;
            }
            return `${chunkInfo.name}.js`;
          },
          preserveModules: false,
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/preload/index.js"),
        },
      },
    },
  },
  renderer: {
    root: ".",
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "index.html"),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
  },
});
