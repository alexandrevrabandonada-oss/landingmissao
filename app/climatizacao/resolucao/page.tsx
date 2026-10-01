import type { Metadata } from "next";
import Link from "next/link";
import ResolutionDashboard, { type CaseOverview } from "./ResolutionDashboard";
import styles from "./resolution.module.css";

const SITE="https://www.alexandrevrabandonada.online";

type Payload={
  summary:Record<string,number>;
  cases:CaseOverview[];
  generated_at:string;
};

async function load():Promise<Payload>{
  try{
    const response=await fetch(SITE+"/api/climatizacao?action=case_overview",{cache:"no-store"});
    if(!response.ok) throw new Error();
    return response.json();
  }catch{
    return {summary:{},cases:[],generated_at:new Date().toISOString()};
  }
}

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"Painel de resolução — Climatização das escolas",
  description:"Acompanhe casos de climatização por escola, problema e estágio de resolução.",
  alternates:{canonical:SITE+"/climatizacao/resolucao"},
};

export default async function ResolutionPage(){
  const data=await load();
  return <main className={styles.page}>
    <section className={styles.hero}>
      <Link href="/climatizacao" className={styles.back}>← Painel de climatização</Link>
      <span>ACOMPANHAMENTO DE RESOLUÇÃO</span>
      <h1>Relato não termina no formulário.</h1>
      <p>Os casos avançam por eventos verificáveis: documentação, cobrança oficial, resposta e resolução registrada.</p>
      <div className={styles.links}>
        <Link href="/climatizacao/ledger">Ledger público</Link>
        <Link href="/climatizacao/evidencias">Evidências</Link>
        <Link href="/climatizacao/dados">Dados abertos</Link>
      </div>
    </section>

    <ResolutionDashboard cases={data.cases} summary={data.summary}/>

    <section className={styles.method}>
      <h2>Como ler este painel</h2>
      <p>“Relatado” significa que a comunidade registrou o problema. “Cobrança preparada” não significa protocolo enviado. “Resolvido” exige base documental ou protocolo vinculado e nota pública.</p>
      <p>O painel mostra fatos operacionais da plataforma; não atribui nota, ranking ou intenção a autoridades.</p>
      <small>Snapshot gerado em {new Date(data.generated_at).toLocaleString("pt-BR")}.</small>
    </section>
  </main>;
}
