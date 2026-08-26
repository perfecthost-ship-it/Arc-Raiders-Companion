import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base must match the GitHub repo name so assets resolve correctly on
// https://<user>.github.io/<repo>/ — change this if you rename the repo.
export default defineConfig({
  plugins: [react()],
  base: "/Arc-Raiders-Companion/",
});
