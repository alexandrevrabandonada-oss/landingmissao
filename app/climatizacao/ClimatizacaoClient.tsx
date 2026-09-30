"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import CivicActions from "./CivicActions";
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
    student_support_count: number;
    total_support_count: number;
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
  integrations: Array<{
    provider: "change_org";
    status: "active";
    public_url: string | null;
    minimum_age: number;
    public_label: string;
    updated_at: string;
  }>;
  civic_contacts: Array<{
    kind: "vereador" | "camara" | "prefeitura";
    name: string;
    email: string | null;
    contact_url: string | null;
    source_url: string;
    is_fallback: boolean;
    sort_order: number;
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

function getStudentSupportToken() {
  const key = "climatizacao_student_support_token";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, generated);
  return generated;
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
  const [studentStatus, setStudentStatus] = useState("");
  const [studentAgeBand, setStudentAgeBand] = useState("");
  const [supportMode, setSupportMode] = useState<"student" | "adult">("student");
  const [civicSchool, setCivicSchool] = useState<School | null>(null);
  const [civicIssue, setCivicIssue] = useState("");
  const [civicScope, setCivicScope] = useState("");

  async function loadSnapshot() {
    try {
      const response = await fetch(API + "?action=snapshot", { cache: "no-store" });
      if (!response.ok) throw new Error("snapshot");
      const data: Snapshot = await response.json();
      setSnapshot(data);
      const schoolSlug = new URLSearchParams(window.location.search).get("escola");
      if (schoolSlug) {
        const deepLinkedSchool = data.schools.find((item) => item.slug === schoolSlug) ?? null;
        if (deepLinkedSchool) {
          setCivicSchool(deepLinkedSchool);
          setSelectedSchool(deepLinkedSchool);
          setSchoolQuery(deepLinkedSchool.name);
        }
      }
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

  const changeOrg = snapshot?.integrations?.find(
    (integration) => integration.provider === "change_org" && integration.status === "active" && integration.public_url,
  );

  function revealCivicActions() {
    window.setTimeout(() => {
      document.getElementById("mobilizar")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  async function submitStudentSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStudentStatus("Registrando seu apoio…");
    const form = new FormData(event.currentTarget);
    const schoolId = form.get("school_id") ? Number(form.get("school_id")) : null;
    const payload = {
      kind: "student_support",
      age_band: form.get("age_band"),
      school_id: schoolId,
      client_token: getStudentSupportToken(),
      guardian_ack: form.get("guardian_ack") === "on",
      website: form.get("website"),
    };

    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!response) {
      setStudentStatus("Não foi possível registrar agora. Tente novamente.");
      return;
    }
    if (response.status === 409) {
      setStudentStatus("Seu apoio estudantil já está contabilizado.");
      return;
    }
    if (response.status === 429) {
      setStudentStatus("Muitos apoios foram enviados deste acesso agora. Tente novamente mais tarde.");
      return;
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      if (body?.error === "guardian_required") {
        setStudentStatus("Para menores de 12 anos, o apoio deve ser registrado junto de pai, mãe ou responsável.");
        return;
      }
      setStudentStatus("Confira a faixa etária e tente novamente.");
      return;
    }

    event.currentTarget.reset();
    setStudentAgeBand("");
    if (schoolId) {
      setCivicSchool(snapshot?.schools.find((item) => item.id === schoolId) ?? null);
    }
    setStudentStatus("Apoio estudantil registrado. Nenhum nome, e-mail ou telefone foi coletado. Agora você pode enviar seu relato pelos canais oficiais.");
    await loadSnapshot();
    revealCivicActions();
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSchool) {
      setReportStatus("Escolha a escola primeiro.");
      return;
    }
    setReportStatus("Enviando…");
    const form = new FormData(event.currentTarget);
    const issueValue = String(form.get("issue") ?? "");
    const scopeValue = String(form.get("scope") ?? "");
    const payload = {
      kind: "report",
      school_id: selectedSchool.id,
      issue: issueValue,
      scope: scopeValue,
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
    setCivicSchool(selectedSchool);
    setCivicIssue(issueValue);
    setCivicScope(scopeValue);
    setReportStatus("Relato registrado. Abaixo você pode abrir os canais oficiais com a escola e o problema já preenchidos.");
    await loadSnapshot();
    revealCivicActions();
  }

  async function submitSignature(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignatureStatus("Enviando…");
    const form = new FormData(event.currentTarget);
    const schoolId = form.get("school_id") ? Number(form.get("school_id")) : null;
    const payload = {
      kind: "signature",
      full_name: form.get("full_name"),
      neighborhood: form.get("neighborhood"),
      relation: form.get("relation"),
      school_id: schoolId,
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
    if (schoolId) {
      setCivicSchool(snapshot?.schools.find((item) => item.id === schoolId) ?? null);
    }
    setSignatureStatus("Assinatura registrada. Agora você pode abrir os canais oficiais e compartilhar o painel.");
    await loadSnapshot();
    revealCivicActions();
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
          <a href="#assinar" className={styles.primary}>Apoiar agora</a>
          <a href="#relatar" className={styles.secondary}>Relatar minha escola</a>
          <a href="#painel" className={styles.secondary}>Ver o painel</a>
        </div>
        <p className={styles.privacy}>
          Estudantes menores podem participar sem informar nome, e-mail, telefone, CPF ou endereço.
        </p>
      </section>

      <section className={styles.metrics} aria-label="Resumo">
        <article><strong>{loading ? "…" : snapshot?.summary.total_support_count ?? "—"}</strong><span>apoios no total</span></article>
        <article><strong>{loading ? "…" : snapshot?.summary.student_support_count ?? "—"}</strong><span>apoios estudantis</span></article>
        <article><strong>{loading ? "…" : snapshot?.summary.signature_count ?? "—"}</strong><span>assinaturas nominais</span></article>
        <article><strong>{loading ? "…" : snapshot?.summary.total_reports ?? "—"}</strong><span>relatos recebidos</span></article>
        <article><strong>{loading ? "…" : snapshot?.summary.total_schools ?? "—"}</strong><span>unidades na base</span></article>
      </section>

      <section className={styles.petitionSection} id="assinar">
        <div className={styles.petitionShell}>
          <div className={styles.petitionIntro}>
            <span className={styles.petitionEyebrow}>01 · ABAIXO-ASSINADO + VOZ ESTUDANTIL</span>
            <h2>Quem estuda também pode participar.</h2>
            <p>
              A cobrança reúne duas formas de apoio: manifestação estudantil anônima para menores de 18 anos
              e assinatura nominal para pessoas adultas.
            </p>
            <div className={styles.demands}>
              <strong>Estamos cobrando transparência e providências sobre:</strong>
              <span>situação da climatização nas 101 unidades</span>
              <span>cronograma escola por escola</span>
              <span>manutenção e infraestrutura elétrica</span>
              <span>medidas para dias de calor intenso e falhas de climatização</span>
            </div>
            <div className={styles.factStack}>
              <a href="https://sapl.voltaredonda.rj.leg.br/norma/9196" target="_blank" rel="noreferrer">
                <b>2023</b><span>Lei 6.303/2023 trata da instalação de ar-condicionado em todas as escolas e creches públicas.</span>
              </a>
              <a href="https://www.voltaredonda.rj.gov.br/comunicacao/noticias/13-sme/9410-prefeitura-de-volta-redonda-inicia-adequa%C3%A7%C3%A3o-de-escolas-da-rede-municipal-para-receberem-aparelhos-de-ar-condicionado/" target="_blank" rel="noreferrer">
                <b>2025</b><span>A Prefeitura informou 25 escolas com refrigeração funcionando, dez em adequação elétrica e projetos para outras 64.</span>
              </a>
              <a href="https://www.voltaredonda.rj.gov.br/comunicacao/noticias/13-sme/11368-alunos-da-rede-p%C3%BAblica-municipal-de-volta-redonda-come%C3%A7am-a-receber-os-uniformes/" target="_blank" rel="noreferrer">
                <b>2026</b><span>A rede municipal é descrita pela Prefeitura com 101 unidades e mais de 34 mil estudantes.</span>
              </a>
            </div>
          </div>

          <div className={styles.supportCard}>
            <div className={styles.supportCounter}>
              <strong>{loading ? "…" : snapshot?.summary.total_support_count ?? 0}</strong>
              <span>apoios contabilizados</span>
            </div>

            <div className={styles.modeSwitch} role="group" aria-label="Escolha como participar">
              <button
                type="button"
                className={supportMode === "student" ? styles.modeActive : styles.modeButton}
                onClick={() => setSupportMode("student")}
              >
                Sou estudante menor de 18
              </button>
              <button
                type="button"
                className={supportMode === "adult" ? styles.modeActive : styles.modeButton}
                onClick={() => setSupportMode("adult")}
              >
                Tenho 18 anos ou mais
              </button>
            </div>

            {supportMode === "student" ? (
              <form className={styles.supportForm} onSubmit={submitStudentSupport}>
                <div className={styles.studentPrivacy}>
                  <strong>Seu apoio é anônimo.</strong>
                  <p>Não pedimos seu nome, e-mail, telefone, foto, CPF ou endereço. Usamos apenas um identificador técnico antiabuso; o IP não é armazenado em texto.</p>
                </div>
                <label>
                  Faixa etária
                  <select
                    name="age_band"
                    required
                    value={studentAgeBand}
                    onChange={(event) => setStudentAgeBand(event.target.value)}
                  >
                    <option value="" disabled>Escolha</option>
                    <option value="under_12">Menos de 12 anos</option>
                    <option value="12_15">12 a 15 anos</option>
                    <option value="16_17">16 ou 17 anos</option>
                  </select>
                </label>
                <label>
                  Sua escola (opcional)
                  <select name="school_id" defaultValue="">
                    <option value="">Prefiro não informar</option>
                    {(snapshot?.schools ?? []).map((school) => (
                      <option value={school.id} key={school.id}>{school.name}</option>
                    ))}
                  </select>
                </label>
                {studentAgeBand === "under_12" ? (
                  <label className={styles.check}>
                    <input type="checkbox" name="guardian_ack" required />
                    Estou preenchendo junto de pai, mãe ou responsável, que autoriza este apoio anônimo.
                  </label>
                ) : null}
                <input name="website" className={styles.honeypot} tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <button className={styles.petitionButton} type="submit">Registrar meu apoio</button>
                <p className={styles.status} aria-live="polite">{studentStatus}</p>
                <p className={styles.microcopy}>
                  Apoios de menores são apresentados separadamente das assinaturas nominais de adultos.
                </p>
              </form>
            ) : (
              <form className={styles.supportForm} onSubmit={submitSignature}>
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
                <button className={styles.petitionButton} type="submit">Assinar o abaixo-assinado</button>
                <p className={styles.status} aria-live="polite">{signatureStatus}</p>
              </form>
            )}

            {changeOrg?.public_url ? (
              <div className={styles.changeBridge}>
                <strong>Também no Change.org</strong>
                <p>
                  O Change.org permite uso da plataforma por pessoas com {changeOrg.minimum_age} anos ou mais.
                  A assinatura lá é independente deste contador.
                </p>
                <a href={changeOrg.public_url} target="_blank" rel="noreferrer">
                  {changeOrg.public_label}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <CivicActions
        schools={snapshot?.schools ?? []}
        contacts={snapshot?.civic_contacts ?? []}
        school={civicSchool}
        setSchool={setCivicSchool}
        issue={civicIssue}
        setIssue={setCivicIssue}
        scope={civicScope}
        setScope={setCivicScope}
        totalSupports={snapshot?.summary.total_support_count ?? 0}
      />

      <section className={styles.section} id="relatar">
        <div className={styles.sectionHead}>
          <span>02 · RELATO RÁPIDO</span>
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
          <span>03 · PAINEL PÚBLICO</span>
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

      <section className={styles.qrSection} aria-labelledby="qr-title">
        <div className={styles.qrCard}>
          <Image
            src="/climatizacao-qr.svg"
            alt="QR code para abrir o painel de climatização"
            width={220}
            height={220}
            unoptimized
          />
          <div>
            <span>ACESSO DIRETO</span>
            <h2 id="qr-title">Leve o formulário até a escola</h2>
            <p>Este QR abre diretamente a página de climatização no site principal.</p>
            <a href="/climatizacao-qr.svg" target="_blank" rel="noreferrer">Abrir QR em tamanho original</a>
          </div>
        </div>
      </section>

      <section className={styles.sources}>
        <h2>Fontes e critérios</h2>
        <p>
          A plataforma separa relato da comunidade, apoio estudantil anônimo, assinatura nominal,
          informação oficial e resposta protocolada.
        </p>
        <div>
          <a href="https://www2.voltaredonda.rj.gov.br/sme/mod/unidades/index.php" target="_blank" rel="noreferrer">Unidades de ensino — Prefeitura</a>
          <a href="https://www.fevre.com.br/" target="_blank" rel="noreferrer">FEVRE — unidades escolares</a>
        </div>
        <p className={styles.disclaimer}>
          Apoio estudantil de menores é contabilizado sem identificação pessoal e aparece separado das assinaturas nominais.
          Relatos recebidos não substituem inspeção técnica ou manifestação oficial do órgão responsável.
        </p>
      </section>

      <a className={styles.stickySupport} href="#assinar" aria-label="Ir para o abaixo-assinado">
        <span>{loading ? "…" : snapshot?.summary.total_support_count ?? 0} apoios</span>
        <strong>APOIAR AGORA</strong>
      </a>
    </>
  );
}
