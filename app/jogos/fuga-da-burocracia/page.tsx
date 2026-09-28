import type { Metadata } from "next";
import { canonicalUrl } from "@/src/content/siteSeo";
import { ChallengeExperience } from "./ChallengeExperience";

const path = "/jogos/fuga-da-burocracia";
const title = "Desafio dos Processos | Alexandre";
const description = "45 segundos, dez advogados e uma cidade industrial. Faça sua marca e desafie um amigo a superá-la.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: canonicalUrl(path) },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "pt_BR",
    url: canonicalUrl(path),
    images: [{ url: "/unity/fuga/challenge-og.png", width: 1731, height: 909, alt: "Alexandre no Desafio dos Processos" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/unity/fuga/challenge-og.png"] },
  robots: { index: true, follow: true },
};

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
  return <ChallengeExperience day={day} target={target} />;
}
