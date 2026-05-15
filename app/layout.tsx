import type { Metadata, Viewport } from "next";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://missaoeluta.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_IDENTITY.fullLabel} · ${SITE_IDENTITY.appName}`,
    template: `%s · ${SITE_IDENTITY.appName}`,
  },
  description:
    `${SITE_IDENTITY.fullLabel}. ${SITE_IDENTITY.appFullLabel}. ${SITE_IDENTITY.mainPhrase}`,
  keywords: [
    SITE_IDENTITY.appName,
    SITE_IDENTITY.contextLabel,
    SITE_IDENTITY.publicName,
    "Volta Redonda",
    "organização popular",
    SITE_IDENTITY.signature,
  ],
  authors: [{ name: SITE_IDENTITY.appName }],
  creator: SITE_IDENTITY.appName,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/lancamento",
    siteName: SITE_IDENTITY.appName,
    title: SITE_IDENTITY.appFullLabel,
    description: `${SITE_IDENTITY.fullLabel}. ${SITE_IDENTITY.mainPhrase}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_IDENTITY.appFullLabel,
    description: `${SITE_IDENTITY.fullLabel}. ${SITE_IDENTITY.mainPhrase}`,
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
