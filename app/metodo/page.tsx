import type { Metadata } from "next";
import { CampanhasDeBaseModule } from "@/src/components/campanhas/CampanhasDeBaseModule";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";

export const metadata: Metadata = {
  title: {
    absolute: `Método | ${SITE_IDENTITY.fullLabel} · ${SITE_IDENTITY.appName}`,
  },
  description:
    `${SITE_IDENTITY.fullLabel}. Formação aplicada com foco em organização popular, território, escuta, missão e participação no ${SITE_IDENTITY.appName}.`,
  alternates: { canonical: "/metodo" },
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

  return (
    <>
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
      <CampanhasDeBaseModule context="publico" refId={ref} />
    </>
  );
}
