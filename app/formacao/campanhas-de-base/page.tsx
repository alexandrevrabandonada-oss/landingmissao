import type { Metadata } from "next";
import { CampanhasDeBaseModule } from "@/src/components/campanhas/CampanhasDeBaseModule";
import { ExternalGamesHubCallout } from "@/src/components/public/ExternalGamesHubCallout";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, SEO_IMAGES } from "@/src/content/siteSeo";

const pageUrl = canonicalUrl("/formacao/campanhas-de-base");
const pageTitle = `Formação em campanhas de base | ${SITE_IDENTITY.appName}`;
const pageDescription =
  `Formação sobre campanhas de base, escuta territorial e organização popular aplicada à ${SITE_IDENTITY.fullLabel}.`;

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
        url: SEO_IMAGES.formacao,
        width: 1200,
        height: 630,
        alt: "Formação em campanhas de base",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [SEO_IMAGES.formacao],
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

export default async function FormacaoCampanhasDeBasePage({ searchParams }: PageProps) {
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
        item: canonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Formação",
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <ExternalGamesHubCallout refId={ref} variant="formacao" />
      <CampanhasDeBaseModule context="interno" refId={ref} />
    </>
  );
}
