"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./climatizacao.module.css";

const API = "/api/climatizacao";

type School = {
  id: number;
  slug: string;
  name: string;
  category: string;
  network: "SME" | "FEVRE";
  report_count: number;
  sem_ar_count: number;
  nao_funciona_count: number;
  parcial_count: number;
  rede_eletrica_count: number;
  manutencao_count: number;
  last_report_at: string | null;
};

type Snapshot = {
  schools: School[];
  summary: {
    total_schools: number;
    total_reports: number;
    schools_with_reports: number;
    signature_count: number;
  };
  protocols: Array<{
    id: string;
    title: string;
    recipient: string;
    channel: string;
    protocol_number: string | null;
    status: string;
    submitted_at: string | null;
    due_at: string | null;
    extension_due_at: string | null;
    public_note: string | null;
    response_url: string | null;
    response_summary: string | null;
    last_checked_at: string | null;
  }>;
  generated_at: string;
};


function publicProtocolStatus(item: Snapshot["protocols"][number]) {
  if (item.status === "answered" || item.status === "closed") return { label: "respondido", overdue: false };
  if (!item.due_at) return { label: item.status, overdue: false };
  const diff = Math.ceil((new Date(item.due_at).getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return { label: `atrasado há ${Math.abs(diff)} dia(s)`, overdue: true };
  if (diff === 0) return { label: "prazo estimado vence hoje", overdue: false };
  return { label: `em prazo · ${diff} dia(s) restantes`, overdue: false };
}

const issueOptions = [
  ["sem_ar", "Não tem ar-condicionado"],
  ["nao_funciona", "Tem, mas não funciona"],
  ["parcial", "Funciona só em parte"],
  ["rede_eletrica", "Problema elétrico / subestação"],
  ["manutencao", "Falta manutenção"],
  ["outro", "Outro problema"],
] as const;

const scopeOptions = [
  ["uma_sala", "Uma sala"],
  ["varias_salas", "Várias salas"],
  ["escola_toda", "A escola toda"],
  ["nao_sei", "Não sei"],
] as const;

export default function ClimatizacaoClient() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [reportStatus, setReportStatus] = useState("");
  const [signatureStatus, setSignatureStatus] = useState("");

  async function loadSnapshot() {
    try {
      const response = await fetch(API + "?action=snapshot", { cache: "no-store" });
      if (!response.ok) throw new Error("snapshot");
      setSnapshot(await response.json());
    } catch {
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSnapshot();
  }, []);

  const filteredSchools = useMemo(() => {
    const schools = snapshot?.schools ?? [];
    const q = schoolQuery.trim().toLocaleLowerCase("pt-BR");
    if (!q) return schools.slice(0, 12);
    return schools
      .filter((school) =>
        [school.name, school.category, school.network]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(q),
      )
      .slice(0, 12);
  }, [schoolQuery, snapshot]);

  const ranked = useMemo(
    () =>
      [...(snapshot?.schools ?? [])]
        .filter((school) => Number(school.report_count) > 0)
        .sort((a, b) => Number(b.report_count) - Number(a.report_count))
        .slice(0, 20),
    [snapshot],
  );

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSchool) {
      setReportStatus("Escolha a escola primeiro.");
      return;
    }
    setReportStatus("Enviando…");
    const form = new FormData(event.currentTarget);
    const payload = {
      kind: "report",
      school_id: selectedSchool.id,
      issue: form.get("issue"),
      scope: form.get("scope"),
      relation: form.get("relation"),
      shift: form.get("shift"),
      website: form.get("website"),
    };

    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!response) {
      setReportStatus("Não foi possível enviar agora. Tente novamente.");
      return;
    }
    if (response.status === 429) {
      setReportStatus("Muitos envios recentes deste acesso. Tente novamente mais tarde.");
      return;
    }
    if (!response.ok) {
      setReportStatus("Não foi possível registrar. Confira os campos e tente de novo.");
      return;
    }

    event.currentTarget.reset();
    setReportStatus("Relato registrado. Obrigado por ajudar a documentar a situação.");
    await loadSnapshot();
  }

  async function submitSignature(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignatureStatus("Enviando…");
    const form = new FormData(event.currentTarget);
    const payload = {
      kind: "signature",
      full_name: form.get("full_name"),
      neighborhood: form.get("neighborhood"),
      relation: form.get("relation"),
      school_id: form.get("school_id") ? Number(form.get("school_id")) : null,
      adult_confirmed: form.get("adult_confirmed") === "on",
      consent: form.get("consent") === "on",
      website: form.get("website"),
    };

    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!response) {
      setSignatureStatus("Não foi possível enviar agora. Tente novamente.");
      return;
    }
    if (response.status === 409) {
      setSignatureStatus("Esta assinatura já foi registrada.");
      return;
    }
    if (response.status === 429) {
      setSignatureStatus("Limite de envios atingido neste acesso. Tente novamente mais tarde.");
      return;
    }
    if (!response.ok) {
      setSignatureStatus("Confira os campos, inclusive confirmação de maioridade e consentimento.");
      return;
    }

    event.currentTarget.reset();
    setSignatureStatus("Assinatura registrada.");
    await loadSnapshot();
  }

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.kicker}>ESCOLA NÃO É SAUNA</div>
        <h1>Climatização nas escolas de Volta Redonda</h1>
        <p className={styles.lead}>
          Um painel público para transformar relatos dispersos em informação verificável:
          escola por escola, protocolo por protocolo, resposta por resposta.
        </p>
        <div className={styles.heroActions}>
          <a href="#relatar" className={styles.primary}>Minha escola está com problema</a>
          <a href="#painel" className={styles.secondary}>Ver o painel</a>
        </div>
        <p className={styles.privacy}>
          Relatar não exige nome, telefone ou e-mail. Não envie foto de aluno nem dado pessoal.
        </p>
      </section>

      <section className={styles.metrics} aria-label="Resumo">
        <article><strong>{loading ? "…" : snapshot?.summary.total_schools ?? "—"}</strong><span>unidades na base</span></article>
        <article><strong>{loading ? "…" : snapshot?.summary.schools_with_reports ?? "—"}</strong><span>com relatos</span></article>
        <article><strong>{loading ? "…" : snapshot?.summary.total_reports ?? "—"}</strong><span>relatos registrados</span></article>
        <article><strong>{loading ? "…" : snapshot?.summary.signature_count ?? "—"}</strong><span>assinaturas</span></article>
      </section>

      <section className={styles.section} id="relatar">
        <div className={styles.sectionHead}>
          <span>01 · RELATO RÁPIDO</span>
          <h2>Qual é a sua escola?</h2>
          <p>Busque pelo nome. A lista reúne 96 unidades da SME e cinco da FEVRE.</p>
        </div>

        <div className={styles.searchBox}>
          <label htmlFor="school-search">Buscar escola</label>
          <input
            id="school-search"
            value={schoolQuery}
            onChange={(event) => setSchoolQuery(event.target.value)}
            placeholder="Ex.: Themis, Paulo VI, Cora Coralina…"
            autoComplete="off"
          />
          <div className={styles.schoolResults}>
            {filteredSchools.map((school) => (
              <button
                type="button"
                key={school.id}
                className={selectedSchool?.id === school.id ? styles.schoolSelected : styles.schoolButton}
                onClick={() => setSelectedSchool(school)}
              >
                <strong>{school.name}</strong>
                <span>{school.network} · {school.category}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedSchool && (
          <form className={styles.form} onSubmit={submitReport}>
            <div className={styles.selectedBanner}>
              <span>Escola selecionada</span>
              <strong>{selectedSchool.name}</strong>
            </div>

            <label>
              O que está acontecendo?
              <select name="issue" required defaultValue="">
                <option value="" disabled>Escolha uma opção</option>
                {issueOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <label>
              O problema atinge:
              <select name="scope" required defaultValue="">
                <option value="" disabled>Escolha uma opção</option>
                {scopeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <div className={styles.twoCols}>
              <label>
                Você é:
                <select name="relation" defaultValue="">
                  <option value="">Prefiro não informar</option>
                  <option value="estudante">Estudante</option>
                  <option value="responsavel">Responsável</option>
                  <option value="profissional">Profissional da educação</option>
                  <option value="comunidade">Comunidade</option>
                </select>
              </label>
              <label>
                Turno:
                <select name="shift" defaultValue="">
                  <option value="">Prefiro não informar</option>
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                  <option value="integral">Integral</option>
                  <option value="nao_sei">Não sei</option>
                </select>
              </label>
            </div>

            <input name="website" className={styles.honeypot} tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <button className={styles.primaryButton} type="submit">Registrar situação</button>
            <p className={styles.status} aria-live="polite">{reportStatus}</p>
          </form>
        )}
      </section>

      <section className={styles.sectionAlt} id="painel">
        <div className={styles.sectionHead}>
          <span>02 · PAINEL PÚBLICO</span>
          <h2>O que já foi relatado</h2>
          <p>Os números abaixo são relatos recebidos pela plataforma. Eles não equivalem, sozinhos, a uma vistoria técnica.</p>
        </div>

        {ranked.length === 0 ? (
          <div className={styles.empty}>Ainda não há relatos publicados. O painel começa a ser preenchido com os primeiros registros.</div>
        ) : (
          <div className={styles.ranking}>
            {ranked.map((school) => (
              <article key={school.id}>
                <div>
                  <strong>{school.name}</strong>
                  <span>{school.network} · {school.category}</span>
                </div>
                <b>{school.report_count} {Number(school.report_count) === 1 ? "relato" : "relatos"}</b>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section} id="assinar">
        <div className={styles.sectionHead}>
          <span>03 · ABAIXO-ASSINADO</span>
          <h2>Assinar a cobrança pública</h2>
          <p>
            Este fluxo é separado dos relatos anônimos. Por proteção de menores, a assinatura digital
            nesta página é destinada a maiores de 18 anos.
          </p>
        </div>

        <form className={styles.form} onSubmit={submitSignature}>
          <label>Nome completo<input name="full_name" minLength={3} maxLength={120} required /></label>
          <label>Bairro<input name="neighborhood" minLength={2} maxLength={80} required /></label>
          <label>
            Relação com a pauta
            <select name="relation" required defaultValue="">
              <option value="" disabled>Escolha uma opção</option>
              <option value="estudante_maior">Estudante com 18 anos ou mais</option>
              <option value="responsavel">Responsável</option>
              <option value="profissional">Profissional da educação</option>
              <option value="comunidade">Morador(a) / comunidade</option>
            </select>
          </label>
          <label>
            Escola relacionada (opcional)
            <select name="school_id" defaultValue="">
              <option value="">Nenhuma específica</option>
              {(snapshot?.schools ?? []).map((school) => (
                <option value={school.id} key={school.id}>{school.name}</option>
              ))}
            </select>
          </label>
          <label className={styles.check}><input type="checkbox" name="adult_confirmed" required /> Confirmo que tenho 18 anos ou mais.</label>
          <label className={styles.check}><input type="checkbox" name="consent" required /> Autorizo o uso do meu nome apenas para contabilização e apresentação formal deste abaixo-assinado.</label>
          <input name="website" className={styles.honeypot} tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button className={styles.primaryButton} type="submit">Assinar</button>
          <p className={styles.status} aria-live="polite">{signatureStatus}</p>
        </form>
      </section>

      <section className={styles.sectionAlt} id="protocolos">
        <div className={styles.sectionHead}>
          <span>04 · RASTREABILIDADE</span>
          <h2>Protocolos e respostas</h2>
          <p>Quando uma cobrança formal for protocolada, número, destinatário, prazo e resposta aparecem aqui.</p>
        </div>
        {(snapshot?.protocols ?? []).length === 0 ? (
          <div className={styles.empty}>Nenhum protocolo publicado ainda.</div>
        ) : (
          <div className={styles.protocols}>
            {snapshot?.protocols.map((item) => {
              const publicStatus = publicProtocolStatus(item);
              return (
                <article key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.recipient} · {item.channel.toUpperCase()}</span>
                  {item.protocol_number && <span>Protocolo: {item.protocol_number}</span>}
                  {item.submitted_at && <span>Enviado em: {new Date(item.submitted_at).toLocaleDateString("pt-BR")}</span>}
                  {item.due_at && <span>Prazo estimado: {new Date(item.due_at).toLocaleDateString("pt-BR")}</span>}
                  <b>{publicStatus.label}</b>
                  {item.response_summary && <p>{item.response_summary}</p>}
                  {item.response_url && <a href={item.response_url} target="_blank" rel="noreferrer">Ver resposta oficial</a>}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.sources}>
        <h2>Fontes e critérios</h2>
        <p>
          A plataforma separa relato da comunidade, informação oficial e resposta protocolada.
          A base escolar combina a listagem pública da SME/FEVRE com atualizações oficiais mais recentes.
        </p>
        <div>
          <a href="https://www2.voltaredonda.rj.gov.br/sme/mod/unidades/index.php" target="_blank" rel="noreferrer">Unidades de ensino — Prefeitura</a>
          <a href="https://www.fevre.com.br/" target="_blank" rel="noreferrer">FEVRE — unidades escolares</a>
        </div>
        <p className={styles.disclaimer}>
          Este painel é uma ferramenta de documentação e participação pública. Relatos recebidos não substituem inspeção técnica ou manifestação oficial do órgão responsável.
        </p>
      </section>
    </>
  );
}
