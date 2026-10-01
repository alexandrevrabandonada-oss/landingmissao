import styles from "./cases.module.css";

export type ClimateCase = {
  id: string;
  issue: string;
  status: string;
  report_count: number;
  opened_at: string;
  last_report_at: string | null;
  updated_at: string;
  resolved_at: string | null;
  public_note: string | null;
  events: Array<{
    id: string;
    event_type: string;
    from_status: string | null;
    to_status: string | null;
    public_note: string | null;
    source_ref: string | null;
    created_at: string;
  }>;
  evidence: Array<{
    id: string;
    evidence_type: string;
    title: string;
    source_url: string | null;
    source_authority: string | null;
    document_date: string | null;
    verification_status: string;
    public_note: string | null;
    created_at: string;
  }>;
  protocols: Array<{
    id: string;
    title: string;
    recipient: string;
    protocol_number: string | null;
    status: string;
    submitted_at: string | null;
    due_at: string | null;
    response_url: string | null;
    response_summary: string | null;
    updated_at: string;
  }>;
};

const issueLabels: Record<string,string>={
  sem_ar:"Sem ar-condicionado",
  nao_funciona:"Aparelho não funciona",
  parcial:"Climatização parcial",
  rede_eletrica:"Rede elétrica / subestação",
  manutencao:"Manutenção",
  outro:"Outro problema",
};

const statusLabels: Record<string,string>={
  reported:"Relatado",
  documenting:"Em documentação",
  official_request:"Cobrança preparada",
  awaiting_response:"Aguardando resposta oficial",
  answered:"Resposta recebida",
  resolved:"Resolvido com registro",
  reopened:"Reaberto",
};

const statusOrder=["reported","documenting","official_request","awaiting_response","answered","resolved"];

function stageIndex(status:string){
  if(status==="reopened") return 0;
  return Math.max(0,statusOrder.indexOf(status));
}

function protocolStatus(status:string){
  if(status==="draft") return "Rascunho preparado";
  if(status==="submitted") return "Protocolado";
  if(status==="answered") return "Respondido";
  if(status==="overdue") return "Prazo vencido";
  if(status==="closed") return "Encerrado";
  return status;
}

export default function CasesPanel({cases}:{cases:ClimateCase[]}){
  return <section className={styles.section} id="casos">
    <div className={styles.head}>
      <span>CICLO DE RESOLUÇÃO</span>
      <h2>Do relato à resposta.</h2>
      <p>Cada problema é acompanhado separadamente. O status só avança quando existe um evento público correspondente.</p>
    </div>

    {cases.length===0?<div className={styles.empty}>Ainda não há caso consolidado nesta escola.</div>:
      <div className={styles.grid}>{cases.map(item=>{
        const current=stageIndex(item.status);
        return <article key={item.id} className={styles.card}>
          <div className={styles.cardTop}>
            <div><span>{issueLabels[item.issue]||item.issue}</span><h3>{statusLabels[item.status]||item.status}</h3></div>
            <b>{item.report_count} {item.report_count===1?"relato":"relatos"}</b>
          </div>

          <div className={styles.progress} aria-label={"Status: "+(statusLabels[item.status]||item.status)}>
            {statusOrder.map((stage,index)=><div key={stage} className={index<=current?styles.stepOn:styles.stepOff}>
              <i>{index+1}</i><small>{statusLabels[stage]}</small>
            </div>)}
          </div>

          {item.public_note?<p className={styles.note}>{item.public_note}</p>:null}

          {item.protocols.length?<div className={styles.block}>
            <strong>Cobranças relacionadas</strong>
            {item.protocols.map(protocol=><div className={styles.related} key={protocol.id}>
              <div><b>{protocol.title}</b><span>{protocol.recipient}</span></div>
              <em>{protocolStatus(protocol.status)}</em>
              {protocol.protocol_number?<small>Protocolo {protocol.protocol_number}</small>:null}
              {protocol.response_url?<a href={protocol.response_url} target="_blank" rel="noreferrer">Abrir resposta oficial</a>:null}
            </div>)}
          </div>:null}

          {item.evidence.length?<div className={styles.block}>
            <strong>Evidências vinculadas</strong>
            {item.evidence.map(evidence=><div className={styles.related} key={evidence.id}>
              <div><b>{evidence.title}</b><span>{evidence.source_authority||evidence.evidence_type}</span></div>
              <em>{evidence.verification_status}</em>
              {evidence.source_url?<a href={evidence.source_url} target="_blank" rel="noreferrer">Abrir fonte</a>:null}
            </div>)}
          </div>:null}

          {item.events.length?<details className={styles.timeline}>
            <summary>Ver histórico do caso ({item.events.length})</summary>
            <ol>{item.events.map(event=><li key={event.id}>
              <time>{new Date(event.created_at).toLocaleString("pt-BR")}</time>
              <strong>{event.event_type==="opened"?"Caso aberto":event.event_type==="status_changed"?"Status alterado":event.event_type==="evidence_linked"?"Evidência vinculada":event.event_type==="protocol_linked"?"Cobrança vinculada":event.event_type}</strong>
              {event.from_status||event.to_status?<span>{event.from_status?statusLabels[event.from_status]||event.from_status:""}{event.from_status&&event.to_status?" → ":""}{event.to_status?statusLabels[event.to_status]||event.to_status:""}</span>:null}
              {event.public_note?<p>{event.public_note}</p>:null}
            </li>)}</ol>
          </details>:null}
        </article>;
      })}</div>}
  </section>;
}
