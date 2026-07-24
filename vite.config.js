import { defineConfig } from "vite";

export default defineConfig({
  root: "apps/web",
  server: {
    open: !process.env.E2E,
  },
});
