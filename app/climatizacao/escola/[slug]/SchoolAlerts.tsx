"use client";

import { useEffect, useState } from "react";
import styles from "./school.module.css";

const TOPICS_KEY = "climatizacao_push_schools_v1";
const PREFS_KEY = "climatizacao_push_preferences_v1";

type Preferences = {
  evidence: boolean;
  protocol: boolean;
  case: boolean;
};

const DEFAULT_PREFS: Preferences = {
  evidence: true,
  protocol: true,
  case: true,
};

function decodeKey(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(Array.from(raw).map((char) => char.charCodeAt(0)));
}

function readTopics(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TOPICS_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeTopics(topics: string[]) {
  window.localStorage.setItem(
    TOPICS_KEY,
    JSON.stringify(Array.from(new Set(topics))),
  );
}

function readPreferences(): Record<string, Preferences> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PREFS_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function normalizePreferences(value: Partial<Preferences> | undefined): Preferences {
  return {
    evidence: value?.evidence !== false,
    protocol: value?.protocol !== false,
    case: value?.case !== false,
  };
}

function writeSchoolPreferences(slug: string, preferences: Preferences | null) {
  const current = readPreferences();
  if (preferences) current[slug] = preferences;
  else delete current[slug];
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(current));
}

export default function SchoolAlerts({
  schoolId,
  slug,
  name,
}: {
  schoolId: number;
  slug: string;
  name: string;
}) {
  const [state, setState] = useState<
    "loading" | "idle" | "busy" | "subscribed" | "denied" | "unsupported" | "error"
  >("loading");
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFS);

  async function registration() {
    const reg = await navigator.serviceWorker.register("/climatizacao-sw.js", {
      scope: "/",
    });
    return navigator.serviceWorker.ready.then(() => reg);
  }

  useEffect(() => {
    async function inspect() {
      setPreferences(
        normalizePreferences(readPreferences()[slug] ?? DEFAULT_PREFS),
      );

      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }

      try {
        const reg = await registration();
        const sub = await reg.pushManager.getSubscription();
        setState(sub && readTopics().includes(slug) ? "subscribed" : "idle");
      } catch {
        setState("error");
      }
    }
    void inspect();
  }, [slug]);

  function updatePreference(key: keyof Preferences, value: boolean) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  async function subscribeOrSave() {
    if (!preferences.evidence && !preferences.protocol && !preferences.case) {
      setMessage("Escolha pelo menos um tipo de alerta.");
      return;
    }

    setState("busy");
    setMessage("");

    try {
      const permission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();

      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "idle");
        return;
      }

      const reg = await registration();
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const keyResponse = await fetch(
          "/api/climatizacao?action=push_key",
          { cache: "no-store" },
        );
        if (!keyResponse.ok) throw new Error("push_key");
        const { public_key } = await keyResponse.json();
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeKey(public_key),
        });
      }

      const response = await fetch("/api/climatizacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "push_subscribe",
          school_id: schoolId,
          subscription: sub.toJSON(),
          preferences,
        }),
      });
      if (!response.ok) throw new Error("subscribe_failed");

      writeTopics([...readTopics(), slug]);
      writeSchoolPreferences(slug, preferences);
      setState("subscribed");
      setMessage(
        "Preferências de alerta salvas para " + name + ".",
      );
    } catch {
      setState("error");
      setMessage("Não foi possível salvar os alertas neste navegador.");
    }
  }

  async function disable() {
    setState("busy");
    setMessage("");

    try {
      const reg = await registration();
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await fetch("/api/climatizacao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "push_unsubscribe",
            school_id: schoolId,
            endpoint: sub.endpoint,
          }),
        });

        const remaining = readTopics().filter((item) => item !== slug);
        writeTopics(remaining);
        writeSchoolPreferences(slug, null);

        if (remaining.length === 0) {
          await sub.unsubscribe();
        }
      }

      setState("idle");
      setMessage("Alertas desativados para esta escola.");
    } catch {
      setState("error");
      setMessage("Não foi possível desativar agora.");
    }
  }

  const supported =
    state !== "unsupported" && state !== "denied";

  return (
    <div className={styles.alertBlock}>
      <div className={styles.alertIntro}>
        <span>ALERTAS OPT-IN</span>
        <strong>Escolha o que vale interromper você.</strong>
        <p>
          Sem nome ou e-mail. O endpoint técnico do navegador fica ligado apenas
          à escola e às categorias escolhidas.
        </p>
      </div>

      {supported ? (
        <div className={styles.alertPrefs}>
          <label className={styles.alertChoice}>
            <input
              type="checkbox"
              checked={preferences.evidence}
              onChange={(event) =>
                updatePreference("evidence", event.target.checked)
              }
            />
            <span>
              <b>Evidências e documentos</b>
              <small>Nova fonte pública vinculada à escola.</small>
            </span>
          </label>

          <label className={styles.alertChoice}>
            <input
              type="checkbox"
              checked={preferences.protocol}
              onChange={(event) =>
                updatePreference("protocol", event.target.checked)
              }
            />
            <span>
              <b>Protocolos e respostas</b>
              <small>Envio, prorrogação, resposta ou recurso oficial.</small>
            </span>
          </label>

          <label className={styles.alertChoice}>
            <input
              type="checkbox"
              checked={preferences.case}
              onChange={(event) =>
                updatePreference("case", event.target.checked)
              }
            />
            <span>
              <b>Resolução e reabertura</b>
              <small>Mudança relevante no ciclo público do caso.</small>
            </span>
          </label>
        </div>
      ) : null}

      <div className={styles.alertActions}>
        {state === "unsupported" ? (
          <small>Este navegador não oferece Web Push.</small>
        ) : state === "denied" ? (
          <small>
            Notificações estão bloqueadas nas configurações do navegador.
          </small>
        ) : (
          <button
            type="button"
            onClick={subscribeOrSave}
            disabled={state === "busy" || state === "loading"}
          >
            {state === "busy" || state === "loading"
              ? "Salvando…"
              : state === "subscribed"
                ? "Salvar preferências"
                : "Ativar alertas"}
          </button>
        )}

        {state === "subscribed" ? (
          <button
            type="button"
            onClick={disable}
            className={styles.alertOn}
          >
            Desativar alertas desta escola
          </button>
        ) : null}
      </div>

      {message ? <small className={styles.alertMessage}>{message}</small> : null}
    </div>
  );
}
