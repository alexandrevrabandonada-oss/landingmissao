import type { Metadata } from "next";
import { canonicalUrl } from "@/src/content/siteSeo";
import ClimatizacaoClient from "./ClimatizacaoClient";
import styles from "./climatizacao.module.css";

const pageUrl = canonicalUrl("/climatizacao");

export const metadata: Metadata = {
  title: "Climatização nas escolas de Volta Redonda",
  description:
    "Painel público para registrar problemas de climatização, acompanhar a situação por escola e consultar protocolos e respostas oficiais.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Climatização nas escolas de Volta Redonda",
    description:
      "Relatos da comunidade, dados por escola e acompanhamento público de protocolos.",
    url: pageUrl,
    type: "website",
    locale: "pt_BR",
  },
};

export default function ClimatizacaoPage() {
  return (
    <main className={styles.page}>
      <ClimatizacaoClient />
    </main>
  );
}
