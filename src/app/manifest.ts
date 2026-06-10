import type { MetadataRoute } from "next";

// Web App Manifest (servido em /manifest.webmanifest). Permite "Adicionar à
// tela de início" no smartphone e abre a estação em modo standalone, sem a
// barra do navegador — como um app nativo no aparelho fixo da operação.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Embalei · Estação de Embalagem",
    short_name: "Embalei",
    description:
      "Estação de embalagem para operadores de centro de distribuição.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f6f7",
    theme_color: "#006fee",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
