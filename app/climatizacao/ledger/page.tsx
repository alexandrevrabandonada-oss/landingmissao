import type { Metadata } from "next";
import Link from "next/link";
import LedgerVerifier from "./LedgerVerifier";
import styles from "./ledger.module.css";

export const metadata: Metadata={
  title:"Ledger público — Climatização das escolas",
  description:"Cadeia pública append-only com SHA-256 verificável no navegador.",
  alternates:{canonical:"https://www.alexandrevrabandonada.online/climatizacao/ledger"},
};

export default function Page(){
  return <main className={styles.page}>
    <section className={styles.hero}>
      <Link href="/climatizacao" className={styles.back}>← Painel de climatização</Link>
      <span>LEDGER PÚBLICO · SHA-256</span>
      <h1>Não basta dizer que não mudou. Dá para verificar.</h1>
      <p>Cada evento incorpora o hash anterior. A cadeia pode ser recalculada publicamente no navegador.</p>
      <div className={styles.links}><Link href="/climatizacao/evidencias">Evidências</Link><Link href="/climatizacao/dados">Dados abertos</Link><Link href="/climatizacao/ancora">Âncora externa</Link></div>
    </section>
    <LedgerVerifier/>
    <section className={styles.method}><h2>O que isso prova</h2>
      <p>O ledger registra recibos anônimos, evidências e movimentações de protocolos sem publicar dados pessoais.</p>
      <p>Integridade criptográfica prova consistência da sequência publicada; não transforma um relato comunitário em vistoria técnica.</p>
    </section>
  </main>;
}
