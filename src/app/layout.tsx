import type { Metadata, Viewport } from "next";
import "./globals.css";
import DisableZoom from "@/components/system/DisableZoom";

export const metadata: Metadata = {
  title: "Embalei · Estação de Embalagem",
  description: "Estação de embalagem para operadores de centro de distribuição.",
  applicationName: "Embalei",
  // O arquivo src/app/manifest.ts já é vinculado pelo Next; explicitamos para
  // deixar o contrato claro.
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  // iOS não usa o manifest para o atalho: estas chaves é que fazem a estação
  // abrir em tela cheia (sem barra do Safari) ao "Adicionar à Tela de Início".
  appleWebApp: {
    capable: true,
    title: "Embalei",
    statusBarStyle: "black-translucent",
  },
};

// Estação de embalagem roda em tablet/celular fixo: trava o zoom (pinch e o
// auto-zoom do iOS ao focar input) para a interface não desalinhar na operação.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#006fee",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="light" data-theme="light">
      <body>
        <DisableZoom />
        {children}
      </body>
    </html>
  );
}
