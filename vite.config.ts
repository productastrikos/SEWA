import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  css: { transformer: "lightningcss" },
  resolve: {
    alias: {
      // Ban lucide per brand guidelines — force all icons through our hand-rolled shim.
      "lucide-react": path.resolve(__dirname, "src/lib/icons.tsx"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      server: { entry: "server" },
    }),
    react(),
    ...(command === "build" ? [nitro({ defaultPreset: "cloudflare-module" })] : []),
  ],
}));
