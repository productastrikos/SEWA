// @lovable.dev/vite-tanstack-config already includes tanstack, react, tailwind, path alias, etc.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "node:path";

export default defineConfig({
  tanstackStart: { server: { entry: "server" } },
  vite: {
    resolve: {
      alias: {
        // Ban lucide per brand guidelines — force all icons through our hand-rolled shim.
        "lucide-react": path.resolve(__dirname, "src/lib/icons.tsx"),
      },
    },
  },
});
