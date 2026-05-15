"use client";

import { useState } from "react";
import { copyToClipboardSafe } from "@/src/lib/shareLaunch";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";

interface LaunchShareCardProps {
  dateLabel: string;
  locationLabel: string;
  messageToCopy: string;
  publicUrlLabel: string;
}

function normalizeDate(dateLabel: string) {
  return dateLabel === "DATA_A_CONFIRMAR" ? "DATA EM BREVE" : dateLabel;
}

function normalizeLocation(locationLabel: string) {
  return locationLabel === "LOCAL_A_CONFIRMAR" ? "VOLTA REDONDA" : locationLabel;
}

export function LaunchShareCard({
  dateLabel,
  locationLabel,
  messageToCopy,
  publicUrlLabel,
}: LaunchShareCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayDate = normalizeDate(dateLabel);
  const displayLocation = normalizeLocation(locationLabel);

  async function handleCopyMessage() {
    const ok = await copyToClipboardSafe(messageToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <>
      <div className="launch-share-card-shell">
        <article
          className="launch-share-card"
          role="img"
          aria-label="Card para story: Eu vou no lançamento da pré-campanha e app Missão ÉLuta"
        >
          <div className="launch-share-card__noise" aria-hidden="true" />
          <div className="launch-share-card__orb launch-share-card__orb--yellow" aria-hidden="true" />
          <div className="launch-share-card__orb launch-share-card__orb--rust" aria-hidden="true" />

          <div className="launch-share-card__content">
            <p className="launch-share-card__eyebrow">{SITE_IDENTITY.fullLabel}</p>
            <h3 className="launch-share-card__title">
              EU VOU
              <span>NO LANÇAMENTO</span>
            </h3>

            <p className="launch-share-card__subtitle">
              App Missão ÉLuta
            </p>

            <p className="launch-share-card__name">{SITE_IDENTITY.publicName}</p>

            <p className="launch-share-card__signature">{SITE_IDENTITY.signature}</p>

            <div className="launch-share-card__event">
              <p className="launch-share-card__event-label">DATA • LOCAL</p>
              <p>{displayDate}</p>
              <p>{displayLocation}</p>
            </div>

            <p className="launch-share-card__invite">Chame mais 3 pessoas.</p>
            <p className="launch-share-card__short-link" aria-label="Link curto visual da página">
              {publicUrlLabel}
            </p>

            <p className="launch-share-card__footer">{SITE_IDENTITY.appName}</p>
          </div>
        </article>

        <div className="launch-share-card__actions" role="group" aria-label="Ações do card para compartilhar">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setIsFullscreen(true)}
            aria-label="Abrir card em tela cheia"
          >
            Abrir card em tela cheia
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleCopyMessage}
            aria-label="Copiar mensagem pronta para compartilhar"
          >
            {copied ? "Mensagem copiada!" : "Copiar mensagem"}
          </button>

          <button
            type="button"
            className="btn btn-secondary launch-share-card__story-btn"
            onClick={() => setIsFullscreen(true)}
            aria-label="Gerar print para Story"
          >
            Gerar print para Story
          </button>
        </div>
      </div>

      {isFullscreen && (
        <div className="launch-share-modal" role="dialog" aria-modal="true" aria-label="Card em tela cheia">
          <button
            type="button"
            className="launch-share-modal__backdrop"
            onClick={() => setIsFullscreen(false)}
            aria-label="Fechar visualização"
          />

          <div className="launch-share-modal__content">
            <button
              type="button"
              className="btn btn-ghost launch-share-modal__close"
              onClick={() => setIsFullscreen(false)}
              aria-label="Fechar card em tela cheia"
            >
              Fechar
            </button>

            <article
              className="launch-share-card launch-share-card--fullscreen"
              role="img"
              aria-label="Card em tela cheia para print"
            >
              <div className="launch-share-card__noise" aria-hidden="true" />
              <div className="launch-share-card__orb launch-share-card__orb--yellow" aria-hidden="true" />
              <div className="launch-share-card__orb launch-share-card__orb--rust" aria-hidden="true" />

              <div className="launch-share-card__content">
                <p className="launch-share-card__eyebrow">{SITE_IDENTITY.fullLabel}</p>
                <h3 className="launch-share-card__title">
                  EU VOU
                  <span>NO LANÇAMENTO</span>
                </h3>
                <p className="launch-share-card__subtitle">
                  App Missão ÉLuta
                </p>
                <p className="launch-share-card__name">{SITE_IDENTITY.publicName}</p>
                <p className="launch-share-card__signature">{SITE_IDENTITY.signature}</p>
                <div className="launch-share-card__event">
                  <p className="launch-share-card__event-label">DATA • LOCAL</p>
                  <p>{displayDate}</p>
                  <p>{displayLocation}</p>
                </div>
                <p className="launch-share-card__invite">Chame mais 3 pessoas.</p>
                <p className="launch-share-card__short-link" aria-label="Link curto visual da página">
                  {publicUrlLabel}
                </p>
                <p className="launch-share-card__footer">{SITE_IDENTITY.appName}</p>
              </div>
            </article>
          </div>
        </div>
      )}
    </>
  );
}
