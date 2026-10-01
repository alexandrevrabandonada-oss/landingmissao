"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./privacy.module.css";

const KEYS = {
  followed: "climatizacao_followed_schools_v1",
  receipts: "climatizacao_receipts_v1",
  offline: "climatizacao_offline_queue_v1",
  snapshot: "climatizacao_snapshot_cache_v1",
  studentToken: "climatizacao_student_support_token",
  pushTopics: "climatizacao_push_schools_v1",
} as const;

type LocalState = {
  followed: unknown[];
  receipts: unknown[];
  offline: unknown[];
  hasSnapshot: boolean;
  hasStudentToken: boolean;
  pushTopics: string[];
};

function arrayValue(raw:string|null):unknown[]{
  try{
    const parsed=raw?JSON.parse(raw):[];
    return Array.isArray(parsed)?parsed:[];
  }catch{return[];}
}

function readState():LocalState{
  return {
    followed:arrayValue(localStorage.getItem(KEYS.followed)),
    receipts:arrayValue(localStorage.getItem(KEYS.receipts)),
    offline:arrayValue(localStorage.getItem(KEYS.offline)),
    hasSnapshot:Boolean(localStorage.getItem(KEYS.snapshot)),
    hasStudentToken:Boolean(localStorage.getItem(KEYS.studentToken)),
    pushTopics:arrayValue(localStorage.getItem(KEYS.pushTopics)).filter((item):item is string=>typeof item==="string"),
  };
}

export default function PrivacyCenterClient(){
  const [state,setState]=useState<LocalState|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  function refresh(){setState(readState());}

  useEffect(()=>{refresh();},[]);

  const totalLocal=useMemo(()=>{
    if(!state) return 0;
    return state.followed.length+state.receipts.length+state.offline.length+state.pushTopics.length+
      Number(state.hasSnapshot)+Number(state.hasStudentToken);
  },[state]);

  async function exportData(){
    if(!state) return;
    const exportPayload={
      exported_at:new Date().toISOString(),
      note:"Dados locais deste aparelho. Nenhum dado pessoal do servidor é incluído.",
      local:{
        followed_schools:state.followed,
        receipt_wallet:state.receipts,
        pending_offline_actions:state.offline,
        push_school_slugs:state.pushTopics,
        has_cached_snapshot:state.hasSnapshot,
        has_student_support_token:state.hasStudentToken,
      },
    };
    const blob=new Blob([JSON.stringify(exportPayload,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="climatizacao-dados-locais.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Exportação local gerada.");
  }

  async function unsubscribeAllPush(){
    if(!("serviceWorker" in navigator)) return;
    try{
      const registration=await navigator.serviceWorker.ready;
      const subscription=await registration.pushManager.getSubscription();
      if(!subscription) return;

      const snapshotResponse=await fetch("/api/climatizacao?action=snapshot",{cache:"no-store"});
      const snapshot=snapshotResponse.ok?await snapshotResponse.json():null;
      const schools:Array<{id:number;slug:string}>=snapshot?.schools??[];

      for(const slug of readState().pushTopics){
        const school=schools.find(item=>item.slug===slug);
        if(!school) continue;
        await fetch("/api/climatizacao",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            kind:"push_unsubscribe",
            school_id:school.id,
            endpoint:subscription.endpoint,
          }),
        }).catch(()=>null);
      }

      await subscription.unsubscribe().catch(()=>false);
    }catch{
      // Local reset still proceeds. Expired push endpoints are also disabled by dispatcher failures.
    }
  }

  async function clearLocal(){
    setBusy(true);setMessage("");
    await unsubscribeAllPush();

    for(const key of Object.values(KEYS)) localStorage.removeItem(key);

    if("caches" in window){
      const cacheKeys=await caches.keys().catch(()=>[]);
      await Promise.all(cacheKeys
        .filter(key=>key.startsWith("climatizacao-"))
        .map(key=>caches.delete(key))
      );
    }

    refresh();
    setMessage("Dados locais desta plataforma foram apagados deste navegador.");
    setBusy(false);
  }

  return <main className={styles.page}>
    <section className={styles.hero}>
      <Link href="/climatizacao" className={styles.back}>← Painel de climatização</Link>
      <span>PRIVACIDADE POR DESENHO</span>
      <h1>Veja o que este aparelho guarda.</h1>
      <p>
        A personalização local não precisa virar perfil centralizado. Aqui você inspeciona,
        exporta e apaga os dados que ficam no navegador.
      </p>
    </section>

    <section className={styles.overview}>
      <article><strong>{state?.followed.length??"—"}</strong><span>escolas seguidas localmente</span></article>
      <article><strong>{state?.receipts.length??"—"}</strong><span>recibos na carteira local</span></article>
      <article><strong>{state?.offline.length??"—"}</strong><span>ações offline pendentes</span></article>
      <article><strong>{state?.pushTopics.length??"—"}</strong><span>escolas com alerta neste aparelho</span></article>
    </section>

    <section className={styles.inspect}>
      <h2>Armazenamento local conhecido</h2>
      <div className={styles.rows}>
        <div><b>Escolas seguidas</b><span>{state?.followed.length??0} item(ns)</span><code>{KEYS.followed}</code></div>
        <div><b>Carteira de recibos</b><span>{state?.receipts.length??0} item(ns)</span><code>{KEYS.receipts}</code></div>
        <div><b>Fila offline</b><span>{state?.offline.length??0} item(ns)</span><code>{KEYS.offline}</code></div>
        <div><b>Último snapshot público</b><span>{state?.hasSnapshot?"presente":"ausente"}</span><code>{KEYS.snapshot}</code></div>
        <div><b>Token técnico anti-duplicação</b><span>{state?.hasStudentToken?"presente":"ausente"}</span><code>{KEYS.studentToken}</code></div>
        <div><b>Preferências locais de push</b><span>{state?.pushTopics.length??0} escola(s)</span><code>{KEYS.pushTopics}</code></div>
      </div>
      <p className={styles.note}>
        O token técnico não contém nome, e-mail ou telefone. A lista acima não inclui os registros
        agregados públicos do servidor, porque eles não formam um perfil pessoal deste aparelho.
      </p>
    </section>

    <section className={styles.controls}>
      <div>
        <h2>Controle do usuário</h2>
        <p>Você pode levar uma cópia dos dados locais ou apagar somente os dados desta plataforma.</p>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={exportData} disabled={!state||totalLocal===0}>Exportar JSON local</button>
        <button type="button" onClick={clearLocal} disabled={busy}>{busy?"Limpando…":"Apagar dados locais e alertas"}</button>
      </div>
      {message?<p className={styles.message} aria-live="polite">{message}</p>:null}
    </section>

    <section className={styles.explain}>
      <h2>O que não fazemos</h2>
      <div>
        <span>Não criamos perfil de votação.</span>
        <span>Não publicamos quem contatou qual autoridade.</span>
        <span>Não armazenamos lista de escolas seguidas no servidor.</span>
        <span>Não usamos pageview individual na telemetria da campanha.</span>
      </div>
      <Link href="/climatizacao/dados">Ver os dados públicos agregados →</Link>
    </section>
  </main>;
}
