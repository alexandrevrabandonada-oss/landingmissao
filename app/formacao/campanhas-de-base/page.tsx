import type { Metadata } from "next";
import { CampanhasDeBaseModule } from "@/src/components/campanhas/CampanhasDeBaseModule";
import { ExternalGamesHubCallout } from "@/src/components/public/ExternalGamesHubCallout";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";

export const metadata: Metadata = {
  title: {
    absolute: `Formação | ${SITE_IDENTITY.fullLabel} · ${SITE_IDENTITY.appName}`,
  },
  description:
    `${SITE_IDENTITY.fullLabel}. Módulo interno de formação para pré-campanha de base com comparativos internacionais e aplicação territorial no ${SITE_IDENTITY.appName}.`,
  alternates: { canonical: "/formacao/campanhas-de-base" },
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

  return (
    <>
      <ExternalGamesHubCallout refId={ref} variant="formacao" />
      <CampanhasDeBaseModule context="interno" refId={ref} />
    </>
  );
}
