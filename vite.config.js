import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/app/",
    server: {
        open: "/app/",
        port: 3000,
    },
});
