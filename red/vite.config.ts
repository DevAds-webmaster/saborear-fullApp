import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["img/favicon_XL.png", "img/apple-touch-icon.png"],
      manifest: {
        name: "RED Sabore.ar",
        short_name: "Red Sabore.ar",
        description:
          "Encontrá casas de comidas cerca tuyo y disfrutá de los mejores platos en un solo lugar.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#fdfcf8",
        theme_color: "#06373A",
        lang: "es-AR",
        id: "/",
        icons: [
          {
            src: "img/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "img/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "img/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest}"],
        navigateFallback: "/index.html",
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  server: {
    host: true,
    port: 5175,
  },
});
