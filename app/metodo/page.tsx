import type { Metadata } from "next";
import { CampanhasDeBaseModule } from "@/src/components/campanhas/CampanhasDeBaseModule";
import { ExternalGamesHubCallout } from "@/src/components/public/ExternalGamesHubCallout";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, SEO_IMAGES } from "@/src/content/siteSeo";

const pageUrl = canonicalUrl("/metodo");
const pageTitle = `Método de organização popular | ${SITE_IDENTITY.appName}`;
const pageDescription =
  `Conheça o método da ${SITE_IDENTITY.fullLabel}: escuta, cuidado, organização popular, missões de base e participação territorial.`;

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    locale: "pt_BR",
    url: pageUrl,
    images: [
      {
        url: SEO_IMAGES.metodo,
        width: 1200,
        height: 630,
        alt: `Método ${SITE_IDENTITY.appName}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [SEO_IMAGES.metodo],
  },
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || "";
  }

  return value?.trim() || "";
}

export default async function MetodoPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const ref = getSearchValue(resolvedSearchParams?.ref);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Pré-campanha",
        item: canonicalUrl("/lancamento"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Método",
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <section
        aria-label="Aviso de escopo publico"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-elevated)",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "1060px",
            paddingTop: "0.9rem",
            paddingBottom: "0.9rem",
            fontSize: "0.9rem",
            color: "var(--muted)",
          }}
        >
          Página pública de apresentação do método. A formação aplicada, missões e debates acontecem no App Missão ÉLuta.
        </div>
      </section>
      <ExternalGamesHubCallout refId={ref} variant="metodo" />
      <CampanhasDeBaseModule context="publico" refId={ref} />
    </>
  );
}
