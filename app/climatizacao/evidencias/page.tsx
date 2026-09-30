import type { Metadata } from "next";
import Link from "next/link";
import styles from "./evidence.module.css";
const SITE="https://www.alexandrevrabandonada.online";

type E={id:string;evidence_type:string;source_kind:string;title:string;source_url:string|null;source_authority:string|null;document_date:string|null;content_sha256:string|null;verification_status:string;public_note:string|null;school:{slug:string;name:string;network:string}|null};

async function load():Promise<E[]>{
  try{const r=await fetch(SITE+"/api/climatizacao?action=evidence&limit=250",{cache:"no-store"});if(!r.ok)return[];return (await r.json()).evidence||[];}catch{return[];}
}

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Evidências e fontes — Climatização",description:"Catálogo público de fontes e evidências.",alternates:{canonical:SITE+"/climatizacao/evidencias"}};

export default async function Page(){
  const items=await load();
  return <main className={styles.page}>
    <section className={styles.hero}><Link href="/climatizacao" className={styles.back}>← Painel de climatização</Link>
      <span>PROVENIÊNCIA PÚBLICA</span><h1>De onde vem cada afirmação?</h1>
      <p>Fonte, autoridade, data e status de verificação ficam explícitos e separados do relato comunitário.</p>
      <div className={styles.links}><Link href="/climatizacao/ledger">Ledger e hashes</Link><Link href="/climatizacao/dados">Dados abertos</Link></div>
    </section>
    <section className={styles.summary}><strong>{items.length}</strong><span>evidência(s) catalogada(s)</span></section>
    <section className={styles.grid}>{items.map(x=><article key={x.id}>
      <div className={styles.tags}><span>{x.evidence_type}</span><b>{x.verification_status}</b></div>
      <h2>{x.title}</h2>{x.source_authority?<p className={styles.authority}>{x.source_authority}</p>:null}
      {x.public_note?<p>{x.public_note}</p>:null}
      <dl><div><dt>Data</dt><dd>{x.document_date?new Date(x.document_date+"T12:00:00").toLocaleDateString("pt-BR"):"não informada"}</dd></div>
      <div><dt>Tipo de fonte</dt><dd>{x.source_kind}</dd></div>
      {x.school?<div><dt>Escola</dt><dd><Link href={"/climatizacao/escola/"+x.school.slug}>{x.school.name}</Link></dd></div>:null}
      {x.content_sha256?<div><dt>SHA-256</dt><dd><code>{x.content_sha256}</code></dd></div>:null}</dl>
      <div className={styles.actions}>{x.source_url?<a href={x.source_url} target="_blank" rel="noreferrer">Abrir fonte original</a>:null}<Link href="/climatizacao/ledger">Ver ledger</Link></div>
    </article>)}</section>
    <section className={styles.method}><h2>Status não é opinião</h2><p>“Fonte oficial confirmada” significa que o item foi localizado em canal institucional da autoridade indicada; isso não substitui análise técnica independente do conteúdo.</p></section>
  </main>;
}
