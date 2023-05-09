import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
    server: {
        open: "/app/",
        port: 3000,
    },
    build: {
        rollupOptions: {
            input: {
                landing: resolve(__dirname, "index.html"),
                app: resolve(__dirname, "app/index.html"),
            },
        },
    },
});
