"use client";

import { FormEvent, useState } from "react";
import styles from "./cases.module.css";

export default function EvidenceSuggestionForm({schoolId,schoolName}:{schoolId:number;schoolName:string}){
  const [status,setStatus]=useState("");

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setStatus("Enviando para revisão…");
    const form=new FormData(event.currentTarget);
    const payload={
      kind:"evidence_submission",
      school_id:schoolId,
      issue:form.get("issue"),
      title:form.get("title"),
      source_url:form.get("source_url"),
      source_kind:form.get("source_kind"),
      public_note:form.get("public_note"),
      website:form.get("website"),
    };

    const response=await fetch("/api/climatizacao",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload),
    }).catch(()=>null);

    if(!response){setStatus("Não foi possível enviar agora.");return;}
    if(response.status===409){setStatus("Esta fonte já está na fila ou já foi aceita.");return;}
    if(response.status===429){setStatus("Muitas sugestões recentes deste acesso. Tente mais tarde.");return;}
    if(!response.ok){setStatus("Confira o link e os campos e tente novamente.");return;}

    event.currentTarget.reset();
    setStatus("Fonte recebida. Ela só ficará pública depois de revisão.");
  }

  return <section className={styles.submitSection} id="sugerir-fonte">
    <div className={styles.submitIntro}>
      <span>CONTRIBUIÇÃO COM MODERAÇÃO</span>
      <h2>Tem uma fonte sobre {schoolName}?</h2>
      <p>Envie o link. Não pedimos nome, e-mail ou telefone. A sugestão entra numa fila privada e não é publicada automaticamente.</p>
    </div>
    <form onSubmit={submit} className={styles.form}>
      <label>Tipo de problema
        <select name="issue" defaultValue="">
          <option value="">Geral / não sei</option>
          <option value="sem_ar">Sem ar-condicionado</option>
          <option value="nao_funciona">Aparelho não funciona</option>
          <option value="parcial">Climatização parcial</option>
          <option value="rede_eletrica">Rede elétrica / subestação</option>
          <option value="manutencao">Manutenção</option>
          <option value="outro">Outro</option>
        </select>
      </label>
      <label>Tipo de fonte
        <select name="source_kind" defaultValue="official" required>
          <option value="official">Canal oficial</option>
          <option value="document">Documento público</option>
          <option value="media">Notícia / imprensa</option>
          <option value="other">Outro link verificável</option>
        </select>
      </label>
      <label className={styles.wide}>Título ou descrição curta
        <input name="title" minLength={3} maxLength={240} required placeholder="Ex.: Ordem de serviço, notícia, resposta da Prefeitura…" />
      </label>
      <label className={styles.wide}>Link da fonte
        <input name="source_url" type="url" required placeholder="https://..." />
      </label>
      <label className={styles.wide}>Por que esta fonte é relevante? (opcional)
        <textarea name="public_note" rows={4} maxLength={1600} placeholder="Resuma o que o documento ou link mostra, sem dados pessoais de alunos." />
      </label>
      <input name="website" className={styles.honeypot} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit">Enviar para revisão</button>
      <p className={styles.formStatus} aria-live="polite">{status}</p>
    </form>
    <p className={styles.safety}>Não envie nome, contato, imagem ou informação pessoal de estudante. Para documentos, prefira links já públicos.</p>
  </section>;
}
