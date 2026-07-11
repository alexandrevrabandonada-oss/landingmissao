"use client";

import Link from "next/link";
import { useState } from "react";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";
import { recordExternalJourney } from "@/src/lib/externalJourneyStorage";

interface ParticipationPath {
  id: string;
  level: string;
  title: string;
  description: string;
  disclosure: string;
  cta: string;
  href: string;
  external?: boolean;
}

export function ParticipationLadder({ paths }: { paths: ParticipationPath[] }) {
  const [selectedId, setSelectedId] = useState(paths[0]?.id ?? "");
  const selected = paths.find((path) => path.id === selectedId) ?? paths[0];
  if (!selected) return null;

  const action = (
    <>
      {selected.cta}<span aria-hidden="true">→</span>
    </>
  );

  return (
    <section className="participar-ladder" aria-labelledby="participar-ladder-title">
      <div className="participar-ladder__heading">
        <p>escada de mobilização</p>
        <h2 id="participar-ladder-title">Comece no nível que cabe hoje.</h2>
        <span>Você pode avançar depois. Nenhuma escolha exige concluir as anteriores.</span>
      </div>
      <div className="participar-ladder__layout">
        <div className="participar-ladder__choices" role="group" aria-label="Níveis de participação">
          {paths.map((path, index) => (
            <button
              key={path.id}
              type="button"
              aria-pressed={path.id === selected.id}
              onClick={() => {
                setSelectedId(path.id);
                trackEventIfAvailable("participation_path_selected", { path: path.id, level: index + 1 });
              }}
            >
              <small>{String(index + 1).padStart(2, "0")} · {path.level}</small>
              <strong>{path.title}</strong>
              <span>{path.description}</span>
            </button>
          ))}
        </div>
        <aside className="participar-ladder__next" aria-live="polite">
          <p>O que acontece agora</p>
          <h3>{selected.title}</h3>
          <span>{selected.disclosure}</span>
          {selected.external ? (
            <a href={selected.href} target="_blank" rel="noopener noreferrer" onClick={() => {
              recordExternalJourney({ channel: selected.id, title: selected.title, returnHref: "/participar" });
              trackEventIfAvailable("participation_external_channel_opened", { path: selected.id });
            }}>{action}</a>
          ) : (
            <Link href={selected.href} onClick={() => trackEventIfAvailable("participation_internal_step_opened", { path: selected.id })}>{action}</Link>
          )}
          <small>Você continuará no controle e poderá voltar ao portal.</small>
        </aside>
      </div>
    </section>
  );
}
