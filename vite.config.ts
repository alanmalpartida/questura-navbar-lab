import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Tailwind's dev scanner only knows the source files that existed when the
// server started, so classes in a newly added file (pnpm new-variant, or a
// pull from dev:sync) never get generated. Restart the server when source
// files are added; debounced, since a new variant adds a dozen at once.
function restartOnNewSourceFiles(): Plugin {
  return {
    name: "restart-on-new-source-files",
    apply: "serve",
    configureServer(server) {
      const src = fileURLToPath(new URL("./src/", import.meta.url));
      let timer: ReturnType<typeof setTimeout> | undefined;
      server.watcher.on("add", (file) => {
        if (!file.startsWith(src) || !/\.(tsx?|css)$/.test(file)) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          server.config.logger.info("new source files: restarting so Tailwind scans them", { timestamp: true });
          void server.restart();
        }, 300);
      });
    },
  };
}

// Relative base so the same build works on GitHub Pages (/questura-navbar-lab/)
// and anywhere else it gets dropped.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), restartOnNewSourceFiles()],
  resolve: {
    // Variants import lab stand-ins through this alias, so a copied variant
    // folder keeps working wherever it lands under src/navbars/.
    alias: { "@lab": fileURLToPath(new URL("./src/lab", import.meta.url)) },
  },
});
