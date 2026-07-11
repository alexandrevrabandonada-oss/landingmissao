"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import {
  getStateAgenda,
  stateAgendas,
  type StateAgendaId,
} from "@/src/content/stateAgendas";
import { readStateAgenda, writeStateAgenda } from "@/src/lib/stateAgendaStorage";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";
import styles from "./state-agenda-selector.module.css";

export function StateAgendaSelector() {
  const [selectedAgendaId, setSelectedAgendaId] = useState<StateAgendaId | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const selectedAgenda = getStateAgenda(selectedAgendaId);

  useEffect(() => {
    setSelectedAgendaId(readStateAgenda(window.localStorage));
    setHydrated(true);
  }, []);

  function selectAgenda(agendaId: StateAgendaId) {
    setSelectedAgendaId(agendaId);
    writeStateAgenda(window.localStorage, agendaId);
    trackEventIfAvailable("state_agenda_selected", {
      agenda: agendaId,
      source: "state_agenda_page",
    });
  }

  return (
    <section className={styles.selector} aria-labelledby="state-agenda-selector-title">
      <div className={styles.intro}>
        <div>
          <span>Escolha uma prioridade</span>
          <h2 id="state-agenda-selector-title">Qual luta entra primeiro na sua jornada?</h2>
        </div>
        <p>
          A escolha personaliza seu próximo passo. Ela não é enquete eleitoral e fica somente neste navegador.
        </p>
      </div>

      <ol className={styles.list} aria-label="Pautas estaduais em escuta">
        {stateAgendas.map((agenda) => {
          const selected = agenda.id === selectedAgendaId;
          return (
            <li
              key={agenda.id}
              style={{ "--agenda-accent": agenda.accent } as CSSProperties}
              data-selected={selected}
            >
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => selectAgenda(agenda.id)}
              >
                <span className={styles.number}>{agenda.number}</span>
                <span className={styles.copy}>
                  <strong>{agenda.title}</strong>
                  <small>{agenda.description}</small>
                  <span className={styles.focus} aria-label="Frentes relacionadas">
                    {agenda.focus.map((item) => <i key={item}>{item}</i>)}
                  </span>
                </span>
                <span className={styles.selection} aria-hidden="true">
                  {selected ? <CheckIcon /> : <PlusIcon />}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {hydrated && selectedAgenda ? (
        <div
          className={styles.nextStep}
          style={{ "--agenda-accent": selectedAgenda.accent } as CSSProperties}
          role="status"
          aria-live="polite"
        >
          <div>
            <span>Pauta adicionada à jornada estadual</span>
            <strong>{selectedAgenda.shortTitle}</strong>
            <p>Agora escolha como você pode ajudar essa prioridade a ganhar organização e presença.</p>
          </div>
          <Link
            href="/#escolher-missao"
            onClick={() => trackEventIfAvailable("state_agenda_next_step_clicked", {
              agenda: selectedAgenda.id,
              destination: "mission_selector",
            })}
          >
            Escolher uma missão <ArrowIcon />
          </Link>
        </div>
      ) : (
        <p className={styles.hint} role="status">
          Escolha uma pauta para conectá-la à sua missão e ao cartão compartilhável.
        </p>
      )}
    </section>
  );
}

function CheckIcon() {
  return <svg viewBox="0 0 20 20"><path d="m4 10.5 3.3 3.2L16 5.8" /></svg>;
}

function PlusIcon() {
  return <svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12" /></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
