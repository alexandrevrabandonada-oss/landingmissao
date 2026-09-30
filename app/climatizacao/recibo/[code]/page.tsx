import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReceiptActions from "./ReceiptActions";
import styles from "./receipt.module.css";

const SITE = "https://www.alexandrevrabandonada.online";

type Receipt = {
  code: string;
  action_type: "report" | "student_support" | "signature";
  created_at: string;
  school: {
    id: number;
    slug: string;
    name: string;
    category: string;
    network: string;
  } | null;
};

const labels: Record<Receipt["action_type"], string> = {
  report: "Relato registrado",
  student_support: "Apoio estudantil registrado",
  signature: "Assinatura registrada",
};

async function getReceipt(code: string): Promise<Receipt | null> {
  if (!/^[a-f0-9]{16,48}$/i.test(code)) return null;
  try {
    const response = await fetch(
      `${SITE}/api/climatizacao?action=receipt&code=${encodeURIComponent(code)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.receipt ?? null;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recibo público — Climatização nas escolas",
  description: "Verificação pública de uma participação registrada na plataforma de climatização.",
  robots: { index: false, follow: false },
};

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const receipt = await getReceipt(code);
  if (!receipt) notFound();

  const url = `${SITE}/climatizacao/recibo/${receipt.code}`;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>RECIBO PÚBLICO VERIFICÁVEL</span>
        <h1>{labels[receipt.action_type]}</h1>
        <p className={styles.lead}>
          Este código confirma que a plataforma registrou uma participação. O recibo não publica
          nome, e-mail, telefone, CPF nem outros dados pessoais da pessoa participante.
        </p>

        <div className={styles.code}>
          <small>Código do recibo</small>
          <strong>{receipt.code}</strong>
        </div>

        <dl>
          <div>
            <dt>Tipo</dt>
            <dd>{labels[receipt.action_type]}</dd>
          </div>
          <div>
            <dt>Registrado em</dt>
            <dd>{new Date(receipt.created_at).toLocaleString("pt-BR")}</dd>
          </div>
          <div>
            <dt>Escola</dt>
            <dd>
              {receipt.school ? (
                <Link href={`/climatizacao/escola/${receipt.school.slug}`}>{receipt.school.name}</Link>
              ) : "Apoio sem escola informada"}
            </dd>
          </div>
        </dl>

        <div className={styles.verification}>
          <strong>O que este recibo prova?</strong>
          <p>
            Que uma ação foi aceita pelo backend e recebeu um identificador público único.
            Ele não prova, por si só, a veracidade factual de um relato nem substitui vistoria técnica.
          </p>
        </div>

        <ReceiptActions url={url} />

        <div className={styles.links}>
          <Link href="/climatizacao">Voltar ao painel geral</Link>
          {receipt.school ? <Link href={`/climatizacao/escola/${receipt.school.slug}`}>Abrir página da escola</Link> : null}
        </div>
      </section>
    </main>
  );
}
