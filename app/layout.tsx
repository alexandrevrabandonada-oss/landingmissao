import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://missaoeluta.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Missão ÉLuta — Lançamento",
    template: "%s · Missão ÉLuta",
  },
  description:
    "Pré-campanha Alexandre VR Abandonada. Escutar • Cuidar • Organizar. " +
    "Participe do lançamento da Missão ÉLuta e do app em Volta Redonda.",
  keywords: [
    "Missão ÉLuta",
    "pré-campanha",
    "Alexandre VR Abandonada",
    "Volta Redonda",
    "organização popular",
    "Escutar Cuidar Organizar",
  ],
  authors: [{ name: "Missão ÉLuta" }],
  creator: "Missão ÉLuta",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/lancamento",
    siteName: "Missão ÉLuta",
    title: "Lançamento Missão ÉLuta — Escutar • Cuidar • Organizar",
    description:
      "Pré-campanha Alexandre VR Abandonada. Venha ao lançamento do app e do movimento em Volta Redonda.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lançamento Missão ÉLuta",
    description: "Escutar • Cuidar • Organizar. #ELUTA #VRAbandona",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo-principal" className="skip-link">
          Ir para o conteúdo
        </a>
        <main id="conteudo-principal">{children}</main>
      </body>
    </html>
  );
}
