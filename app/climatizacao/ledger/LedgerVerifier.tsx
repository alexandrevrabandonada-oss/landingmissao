"use client";

import { useEffect, useState } from "react";
import styles from "./ledger.module.css";

type E = {
  id:number; event_type:string; previous_hash:string; entry_hash:string;
  canonical_payload:string; created_at:string;
  school:{name:string;network:string}|null;
};
type H = {id:number;entry_hash:string;created_at:string};
const ZERO="0".repeat(64);

async function hash(text:string){
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");
}

export default function LedgerVerifier(){
  const [events,setEvents]=useState<E[]>([]);
  const [head,setHead]=useState<H|null>(null);
  const [total,setTotal]=useState<number|null>(null);
  const [status,setStatus]=useState("Pronto para verificar no seu navegador.");
  const [state,setState]=useState<"idle"|"running"|"valid"|"invalid"|"error">("idle");

  useEffect(()=>{
    fetch("/api/climatizacao?action=ledger&limit=30&direction=desc",{cache:"no-store"})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(p=>{setEvents(p.ledger?.events||[]);setHead(p.ledger?.head||null);setTotal(p.ledger?.total_count??null);})
      .catch(()=>setEvents([]));
  },[]);

  async function verify(){
    setState("running"); setStatus("Verificando a cadeia pública…");
    let after=0, prev=ZERO, checked=0, expected:H|null=null;
    try{
      for(let page=0;page<200;page++){
        const r=await fetch("/api/climatizacao?action=ledger&limit=250&after_id="+after,{cache:"no-store"});
        if(!r.ok) throw new Error();
        const p=await r.json();
        const batch:E[]=p.ledger?.events||[];
        expected=p.ledger?.head||expected;
        if(!batch.length) break;
        for(const e of batch){
          if(e.previous_hash!==prev){setState("invalid");setStatus("Encadeamento inválido no evento #"+e.id+".");return;}
          if(await hash(e.canonical_payload)!==e.entry_hash){setState("invalid");setStatus("SHA-256 inválido no evento #"+e.id+".");return;}
          prev=e.entry_hash;after=e.id;checked++;
        }
        setStatus(checked+" evento(s) conferidos…");
        if(!p.ledger?.has_more) break;
      }
      if(expected&&(after!==expected.id||prev!==expected.entry_hash)){setState("invalid");setStatus("O head calculado não corresponde ao head publicado.");return;}
      setState("valid");setStatus("Cadeia íntegra: "+checked+" evento(s) recalculados neste navegador.");
    }catch{
      setState("error");setStatus("Não foi possível concluir a verificação agora.");
    }
  }

  return <>
    <section className={styles.verify}>
      <div><span>VERIFICAÇÃO INDEPENDENTE</span><h2>Recalcule a cadeia no navegador.</h2>
      <p>O payload canônico, o hash SHA-256 e o hash anterior são públicos.</p></div>
      <div className={styles.counter}><strong>{total??"—"}</strong><small>eventos</small>
      <button onClick={verify} disabled={state==="running"}>{state==="running"?"Verificando…":"Verificar cadeia completa"}</button></div>
      <div className={styles.result+" "+styles[state]}><b>{state==="valid"?"✓ ÍNTEGRA":state==="invalid"?"✕ FALHA":state==="running"?"… VERIFICANDO":state==="error"?"! ERRO":"PRONTA"}</b>
      <p>{status}</p>{head?<code>HEAD # {head.id} · {head.entry_hash}</code>:null}</div>
    </section>
    <section className={styles.feed}><span>EVENTOS RECENTES</span><h2>Histórico append-only</h2>
      <div className={styles.events}>{events.map(e=><article key={e.id}>
        <div className={styles.num}>#{e.id}</div><div>
        <strong>{e.event_type}</strong><time>{new Date(e.created_at).toLocaleString("pt-BR")}</time>
        {e.school?<p>{e.school.name} · {e.school.network}</p>:null}
        <code>hash: {e.entry_hash}</code><code>anterior: {e.previous_hash}</code>
        <details><summary>Payload usado no hash</summary><pre>{e.canonical_payload}</pre></details>
        </div></article>)}</div>
    </section>
  </>;
}
