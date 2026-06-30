import type { Metadata, Viewport } from "next";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, publicAssetUrl, SEO_IMAGES, SITE_URL } from "@/src/content/siteSeo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_IDENTITY.publicName} | Pré-candidato a deputado estadual`,
    template: `%s · ${SITE_IDENTITY.appName}`,
  },
  description:
    `Conheça a ${SITE_IDENTITY.fullLabel}: organização popular, escuta territorial, App ${SITE_IDENTITY.appName}, voluntariado, vaquinha e materiais de apoio.`,
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
    url: canonicalUrl("/lancamento"),
    siteName: SITE_IDENTITY.publicName,
    title: `${SITE_IDENTITY.publicName} | Pré-candidato a deputado estadual`,
    description: `${SITE_IDENTITY.fullLabel}. ${SITE_IDENTITY.mainPhrase}`,
    images: [
      {
        url: SEO_IMAGES.lancamento,
        width: 1200,
        height: 630,
        alt: SITE_IDENTITY.fullLabel,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_IDENTITY.publicName} | Pré-candidato a deputado estadual`,
    description: `${SITE_IDENTITY.fullLabel}. ${SITE_IDENTITY.mainPhrase}`,
    images: [SEO_IMAGES.lancamento],
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
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_IDENTITY.publicName,
    alternateName: SITE_IDENTITY.fullLabel,
    url: SITE_URL,
    inLanguage: "pt-BR",
    image: publicAssetUrl(SEO_IMAGES.lancamento),
    description: `${SITE_IDENTITY.fullLabel}. ${SITE_IDENTITY.mainPhrase}`,
  };

  return (
    <html lang="pt-BR">
      <body>
        <JsonLd data={websiteJsonLd} />
        <a href="#conteudo-principal" className="skip-link">
          Ir para o conteúdo
        </a>
        <main id="conteudo-principal">{children}</main>
      </body>
    </html>
  );
}
