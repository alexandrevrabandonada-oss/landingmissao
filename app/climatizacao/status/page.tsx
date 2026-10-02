import type { Metadata } from "next";
import Link from "next/link";
import styles from "./status.module.css";

export const dynamic="force-dynamic";

export const metadata:Metadata={
  title:"Status da plataforma — Climatização",
  description:"Saúde pública dos componentes da plataforma de climatização.",
  robots:{index:false,follow:false},
};

type Health={
  ok:boolean;
  status:"operational"|"degraded"|"down";
  generated_at:string;
  school_count:number;
  ledger_head:{id:number;entry_hash:string;created_at:string}|null;
  checks:Record<string,{ok:boolean;status?:number;detail?:string;latency_ms?:number}>;
};

async function health():Promise<Health|null>{
  try{
    const r=await fetch("https://www.alexandrevrabandonada.online/api/climatizacao/health",{cache:"no-store"});
    const data=await r.json();
    return data;
  }catch{return null;}
}

const names:Record<string,string>={
  public_api:"API pública",
  ledger:"Ledger",
  evidence:"Evidências",
  open_data:"Dados abertos",
  pwa_manifest:"Manifesto PWA",
  service_worker:"Service Worker",
  rss_feed:"Feed RSS",
  push_public_key:"Web Push",
  resolution_cases:"Casos de resolução",
  aggregate_metrics:"Telemetria agregada",
  resolution_page:"Painel de resolução",
  external_anchor:"Âncora externa do ledger",
  openapi_spec:"OpenAPI pública",
};

export default async function StatusPage(){
  const data=await health();
  return <main className={styles.page}>
    <section className={styles.hero}>
      <Link href="/climatizacao" className={styles.back}>← Painel de climatização</Link>
      <span>STATUS PÚBLICO</span>
      <h1>{data?.status==="operational"?"Operação normal":data?.status==="degraded"?"Operação degradada":"Atenção operacional"}</h1>
      <p>Verificação pública dos componentes essenciais da plataforma. Nenhum segredo ou dado pessoal é exibido aqui.</p>
    </section>

    <section className={styles.overview}>
      <article><strong>{data?.school_count??"—"}</strong><span>escolas na base</span></article>
      <article><strong>{data?.ledger_head?"#"+data.ledger_head.id:"—"}</strong><span>head do ledger</span></article>
      <article><strong>{data?.status==="operational"?"OK":data?.status==="degraded"?"~":"!"}</strong><span>{data?.status==="degraded"?"degradação não crítica":"estado geral"}</span></article>
    </section>

    <section className={styles.checks}>
      {data?Object.entries(data.checks).map(([key,item])=><article key={key} className={item.ok?styles.ok:styles.fail}>
        <div><b>{item.ok?"✓":"!"}</b><strong>{names[key]||key}</strong></div>
        <span>HTTP {item.status??"—"} · {item.latency_ms??"—"} ms</span>
        <p>{item.detail||"sem detalhe"}</p>
      </article>):<div className={styles.empty}>Não foi possível carregar o health endpoint.</div>}
    </section>

    <section className={styles.foot}>
      <p>Última verificação: {data?.generated_at?new Date(data.generated_at).toLocaleString("pt-BR"):"indisponível"}.</p>
      {data?.ledger_head?<code>{data.ledger_head.entry_hash}</code>:null}
      <div><a href="/api/climatizacao/health">Abrir health JSON</a><Link href="/climatizacao/ledger">Verificar ledger</Link><Link href="/climatizacao/ancora">Comparar âncora externa</Link></div>
    </section>
  </main>;
}
