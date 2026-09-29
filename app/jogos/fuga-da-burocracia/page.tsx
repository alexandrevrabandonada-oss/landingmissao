import type { Metadata } from "next";
import { canonicalUrl } from "@/src/content/siteSeo";
import { ChallengeExperience } from "./ChallengeExperience";

const path = "/jogos/fuga-da-burocracia";
const title = "Desafio dos Processos | Alexandre";
const description = "Protocole sua marca em 45 segundos. Uma cidade inteira faz perguntas; dez advogados tentam atrasar a resposta.";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const version = one(params?.v);
  const preview = version === "1" ? "/unity/fuga/challenge-og.png" : version === "2" ? "/unity/fuga/challenge-og-v2.png" : "/unity/fuga/challenge-og-v3.png";
  return {
  title: { absolute: title },
  description,
  alternates: { canonical: canonicalUrl(path) },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "pt_BR",
    url: canonicalUrl(path),
    images: [{ url: preview, width: 1672, height: 941, alt: "Alexandre no Desafio dos Processos, em uma cidade industrial fictícia" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [preview] },
  robots: { index: true, follow: true },
  };
}

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

function todayInBrazil() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function validDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export default async function ChallengePage({ searchParams }: Props) {
  const params = await searchParams;
  const suppliedDay = one(params?.day);
  const day = validDay(suppliedDay) ? suppliedDay : todayInBrazil();
  const rawTarget = Number(one(params?.target));
  const target = Number.isSafeInteger(rawTarget) && rawTarget > 0 ? Math.min(rawTarget, 100000) : 0;
  const version = one(params?.v) === "1" ? 1 : one(params?.v) === "2" ? 2 : 3;
  return <ChallengeExperience day={day} target={target} version={version} />;
}
