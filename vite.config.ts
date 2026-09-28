import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Relative base so the same build works on GitHub Pages (/questura-navbar-lab/)
// and anywhere else it gets dropped.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    // Variants import lab stand-ins through this alias, so a copied variant
    // folder keeps working wherever it lands under src/navbars/.
    alias: { "@lab": fileURLToPath(new URL("./src/lab", import.meta.url)) },
  },
});
