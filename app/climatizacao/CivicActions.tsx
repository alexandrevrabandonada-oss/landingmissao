"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import styles from "./climatizacao.module.css";

type School = {
  id: number;
  slug: string;
  name: string;
  network: "SME" | "FEVRE";
};

type CivicContact = {
  kind: "vereador" | "camara" | "prefeitura";
  name: string;
  email: string | null;
  contact_url: string | null;
  source_url: string;
  is_fallback: boolean;
  sort_order: number;
};

type Props = {
  schools: School[];
  contacts: CivicContact[];
  initialSchool: School | null;
  totalSupports: number;
};

const issueLabels: Record<string, string> = {
  sem_ar: "não há ar-condicionado",
  nao_funciona: "há ar-condicionado, mas não está funcionando",
  parcial: "a climatização funciona apenas parcialmente",
  rede_eletrica: "há problema de rede elétrica ou subestação",
  manutencao: "há necessidade de manutenção",
  outro: "há problema de climatização relatado pela comunidade",
};

const scopeLabels: Record<string, string> = {
  uma_sala: "uma sala",
  varias_salas: "várias salas",
  escola_toda: "a escola toda",
  nao_sei: "abrangência ainda não confirmada",
};

export default function CivicActions({
  schools,
  contacts,
  initialSchool,
  totalSupports,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [school, setSchool] = useState<School | null>(initialSchool);
  const [issue, setIssue] = useState("");
  const [scope, setScope] = useState("");

  useEffect(() => {
    if (initialSchool) {
      setSchool(initialSchool);
      return;
    }
    const schoolSlug = new URLSearchParams(window.location.search).get("escola");
    if (schoolSlug) {
      setSchool(schools.find((item) => item.slug === schoolSlug) ?? null);
    }
  }, [initialSchool, schools]);

  const schoolUrl = useMemo(() => {
    const origin = typeof window === "undefined" ? "https://www.alexandrevrabandonada.online" : window.location.origin;
    const url = school?.slug
      ? new URL(`/climatizacao/escola/${school.slug}`, origin)
      : new URL("/climatizacao", origin);
    if (!school?.slug) url.hash = "assinar";
    return url.toString();
  }, [school]);

  const factualMessage = useMemo(() => {
    const schoolLine = school ? `Escola/unidade: ${school.name} (${school.network}).` : "Escola/unidade: ainda não selecionada.";
    const issueLine = issue ? `Situação registrada: ${issueLabels[issue] ?? "problema de climatização"}.` : "Situação: apoio à apuração das condições de climatização da unidade.";
    const scopeLine = scope ? `Abrangência informada: ${scopeLabels[scope] ?? scope}.` : "";

    return [
      "Olá.",
      "",
      "Estou entrando em contato a partir do painel público de climatização das escolas de Volta Redonda.",
      schoolLine,
      issueLine,
      scopeLine,
      "",
      "Solicito, por favor, informação sobre a situação atual da climatização dessa unidade e sobre providências, fiscalização ou encaminhamentos já existentes, incluindo manutenção, adequação elétrica e cronograma quando houver.",
      "",
      `Painel público: ${schoolUrl}`,
      "",
      "Esta mensagem está sendo enviada por mim, de forma voluntária. Peço confirmação de recebimento.",
    ].filter(Boolean).join("\n");
  }, [school, issue, scope, schoolUrl]);

  const shareText = useMemo(() => {
    if (school) {
      return `Painel público de climatização — ${school.name}. Veja relatos, apoios e acompanhamento de protocolos: ${schoolUrl}`;
    }
    return `Painel público de climatização das escolas de Volta Redonda: relatos, apoios e acompanhamento de protocolos. ${schoolUrl}`;
  }, [school, schoolUrl]);

  const vereadores = contacts.filter((item) => item.kind === "vereador");
  const prefeitura = contacts.find((item) => item.kind === "prefeitura");
  const camara = contacts.find((item) => item.kind === "camara");

  function mailto(contact: CivicContact) {
    const subjectBase = school ? `Climatização — ${school.name}` : "Climatização nas escolas de Volta Redonda";
    const subject = contact.is_fallback && contact.kind === "vereador"
      ? `A/C Gabinete ${contact.name} — ${subjectBase}`
      : subjectBase;
    const email = contact.email ?? "";
    return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(factualMessage)}`;
  }

  function markOpened(name: string) {
    setOpened((current) => ({ ...current, [name]: true }));
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(factualMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    const share = (navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    }).share;
    if (share) {
      await share.call(navigator, {
        title: school ? `Climatização — ${school.name}` : "Climatização nas escolas de Volta Redonda",
        text: shareText,
        url: schoolUrl,
      }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const openedCount = vereadores.filter((item) => opened[item.name]).length;

  return (
    <section className={styles.actionSection} id="mobilizar">
      <div className={styles.actionShell}>
        <div className={styles.actionIntro}>
          <span>05 · ENVIAR E COMPARTILHAR</span>
          <h2>Seu relato pode chegar aos canais oficiais.</h2>
          <p>
            Escolha a escola e, se quiser, detalhe o problema. A mensagem é montada automaticamente,
            mas quem decide abrir e enviar cada contato é você.
          </p>
          <div className={styles.actionSelectors}>
            <label>
              Escola
              <select
                value={school?.id ?? ""}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  const id = Number(event.target.value);
                  setSchool(schools.find((item) => item.id === id) ?? null);
                }}
              >
                <option value="">Selecione uma escola</option>
                {schools.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label>
              Situação
              <select value={issue} onChange={(event: ChangeEvent<HTMLSelectElement>) => setIssue(event.target.value)}>
                <option value="">Sem detalhar</option>
                <option value="sem_ar">Não tem ar-condicionado</option>
                <option value="nao_funciona">Tem, mas não funciona</option>
                <option value="parcial">Funciona só em parte</option>
                <option value="rede_eletrica">Rede elétrica / subestação</option>
                <option value="manutencao">Falta manutenção</option>
                <option value="outro">Outro problema</option>
              </select>
            </label>
            <label>
              Abrangência
              <select value={scope} onChange={(event: ChangeEvent<HTMLSelectElement>) => setScope(event.target.value)}>
                <option value="">Sem detalhar</option>
                <option value="uma_sala">Uma sala</option>
                <option value="varias_salas">Várias salas</option>
                <option value="escola_toda">Escola toda</option>
                <option value="nao_sei">Não sei</option>
              </select>
            </label>
          </div>
        </div>

        <div className={styles.shareWall}>
          <div className={styles.shareHeadline}>
            <strong>{totalSupports}</strong>
            <span>apoios registrados</span>
          </div>
          <a
            className={styles.whatsappShare}
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
          >
            Compartilhar no WhatsApp
          </a>
          <button type="button" onClick={nativeShare}>Compartilhar pelo celular</button>
          <button type="button" onClick={copyMessage}>{copied ? "Copiado" : "Copiar mensagem pronta"}</button>
          <a href={schoolUrl}>Abrir link específico desta escola</a>
        </div>
      </div>

      <div className={styles.officialChannels}>
        <div className={styles.officialLead}>
          <span>CANAIS DO EXECUTIVO</span>
          <h3>Prefeitura e Ouvidoria</h3>
          <p>O texto acima pode ser enviado pelo seu próprio e-mail ou colado na Ouvidoria oficial.</p>
        </div>
        <div className={styles.officialCards}>
          {prefeitura?.email ? (
            <a href={mailto(prefeitura)} onClick={() => markOpened(prefeitura.name)}>
              <strong>E-mail da Prefeitura</strong>
              <span>{prefeitura.email}</span>
            </a>
          ) : null}
          {prefeitura?.contact_url ? (
            <a href={prefeitura.contact_url} target="_blank" rel="noreferrer">
              <strong>Abrir Ouvidoria oficial</strong>
              <span>Copie a mensagem pronta e protocole no canal da Prefeitura.</span>
            </a>
          ) : null}
          {camara?.email ? (
            <a href={mailto(camara)} onClick={() => markOpened(camara.name)}>
              <strong>Direção-Geral da Câmara</strong>
              <span>{camara.email}</span>
            </a>
          ) : null}
        </div>
      </div>

      <div className={styles.councilSection}>
        <div className={styles.councilHead}>
          <div>
            <span>LEGISLATURA 2025–2028</span>
            <h3>21 vereadores</h3>
            <p>Cada botão abre uma mensagem separada no seu aplicativo de e-mail. Nada é enviado sem sua ação.</p>
          </div>
          <strong>{openedCount}/21 contatos abertos nesta sessão</strong>
        </div>
        <div className={styles.councilGrid}>
          {vereadores.map((contact) => (
            <article key={contact.name} className={opened[contact.name] ? styles.councilDone : styles.councilCard}>
              <div>
                <strong>{contact.name}</strong>
                <span>
                  {contact.is_fallback ? "Encaminhamento via Direção-Geral da Câmara" : contact.email}
                </span>
              </div>
              <div className={styles.councilActions}>
                <a href={mailto(contact)} onClick={() => markOpened(contact.name)}>Abrir e-mail</a>
                <a href={contact.contact_url ?? contact.source_url} target="_blank" rel="noreferrer">Contato oficial</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
