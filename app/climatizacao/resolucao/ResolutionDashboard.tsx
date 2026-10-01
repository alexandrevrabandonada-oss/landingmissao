"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./resolution.module.css";

export type CaseOverview={
  id:string;
  issue:string;
  status:string;
  report_count:number;
  opened_at:string;
  last_report_at:string|null;
  updated_at:string;
  resolved_at:string|null;
  public_note:string|null;
  open_days:number;
  school:{id:number;slug:string;name:string;category:string;network:string}|null;
};

const issueLabels:Record<string,string>={
  sem_ar:"Sem ar-condicionado",
  nao_funciona:"Aparelho não funciona",
  parcial:"Climatização parcial",
  rede_eletrica:"Rede elétrica / subestação",
  manutencao:"Manutenção",
  outro:"Outro",
};

const statusLabels:Record<string,string>={
  reported:"Relatado",
  documenting:"Documentando",
  official_request:"Cobrança preparada",
  awaiting_response:"Aguardando resposta",
  answered:"Resposta recebida",
  resolved:"Resolvido",
  reopened:"Reaberto",
};

export default function ResolutionDashboard({
  cases,
  summary,
}:{
  cases:CaseOverview[];
  summary:Record<string,number>;
}){
  const [status,setStatus]=useState("");
  const [issue,setIssue]=useState("");

  const filtered=useMemo(()=>cases.filter(item=>
    (!status||item.status===status)&&(!issue||item.issue===issue)
  ),[cases,status,issue]);

  return <>
    <section className={styles.summary}>
      <article><strong>{summary.total??0}</strong><span>casos públicos</span></article>
      <article><strong>{summary.schools_with_cases??0}</strong><span>escolas com caso</span></article>
      <article><strong>{summary.awaiting_response??0}</strong><span>aguardando resposta</span></article>
      <article><strong>{summary.resolved??0}</strong><span>resolvidos</span></article>
    </section>

    <section className={styles.filters}>
      <label>Status
        <select value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="">Todos</option>
          {Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>Problema
        <select value={issue} onChange={(e)=>setIssue(e.target.value)}>
          <option value="">Todos</option>
          {Object.entries(issueLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <span>{filtered.length} resultado(s)</span>
    </section>

    <section className={styles.list}>
      {filtered.length===0?<div className={styles.empty}>Nenhum caso corresponde aos filtros.</div>:
      filtered.map(item=><article key={item.id}>
        <div className={styles.top}>
          <div>
            <span>{item.school?.network??"—"} · {item.school?.category??"—"}</span>
            <h2>{item.school?.name??"Unidade não identificada"}</h2>
          </div>
          <b data-status={item.status}>{statusLabels[item.status]??item.status}</b>
        </div>
        <div className={styles.meta}>
          <span><strong>{issueLabels[item.issue]??item.issue}</strong></span>
          <span>{item.report_count} relato(s)</span>
          <span>{item.open_days} dia(s) aberto</span>
          <span>Atualizado {new Date(item.updated_at).toLocaleString("pt-BR")}</span>
        </div>
        {item.public_note?<p>{item.public_note}</p>:null}
        {item.school?<Link href={"/climatizacao/escola/"+item.school.slug+"#casos"}>Abrir caso na escola →</Link>:null}
      </article>)}
    </section>
  </>;
}
