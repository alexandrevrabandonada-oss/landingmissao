"use client";

import { useEffect, useState } from "react";
import styles from "./school.module.css";

const TOPICS_KEY = "climatizacao_push_schools_v1";

function decodeKey(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(Array.from(raw).map((char) => char.charCodeAt(0)));
}

function readTopics(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TOPICS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTopics(topics: string[]) {
  window.localStorage.setItem(TOPICS_KEY, JSON.stringify(Array.from(new Set(topics))));
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
  const [state, setState] = useState<"loading"|"idle"|"busy"|"subscribed"|"denied"|"unsupported"|"error">("loading");
  const [message, setMessage] = useState("");

  async function registration() {
    const reg = await navigator.serviceWorker.register("/climatizacao-sw.js", { scope: "/" });
    return navigator.serviceWorker.ready.then(() => reg);
  }

  useEffect(() => {
    async function inspect() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
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

  async function enable() {
    setState("busy");
    setMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "idle");
        return;
      }

      const reg = await registration();
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const keyResponse = await fetch("/api/climatizacao?action=push_key", { cache: "no-store" });
        if (!keyResponse.ok) throw new Error("push_key");
        const { public_key } = await keyResponse.json();
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeKey(public_key),
        });
      }

      const json = sub.toJSON();
      const response = await fetch("/api/climatizacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "push_subscribe",
          school_id: schoolId,
          subscription: json,
        }),
      });
      if (!response.ok) throw new Error("subscribe_failed");

      writeTopics([...readTopics(), slug]);
      setState("subscribed");
      setMessage("Alertas ativados para " + name + ".");
    } catch {
      setState("error");
      setMessage("Não foi possível ativar os alertas neste navegador.");
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
        if (remaining.length === 0) await sub.unsubscribe();
      }
      setState("idle");
      setMessage("Alertas desativados para esta escola.");
    } catch {
      setState("error");
      setMessage("Não foi possível desativar agora.");
    }
  }

  return (
    <div className={styles.alertBlock}>
      <div>
        <span>ALERTAS OPT-IN</span>
        <strong>Receber mudanças relevantes desta escola</strong>
        <p>
          Sem nome ou e-mail. O navegador será avisado sobre evidências e atualizações públicas relevantes,
          não sobre cada apoio ou relato.
        </p>
      </div>

      {state === "subscribed" ? (
        <button type="button" onClick={disable} className={styles.alertOn}>
          ✓ Alertas ativados · desativar
        </button>
      ) : state === "unsupported" ? (
        <small>Este navegador não oferece Web Push.</small>
      ) : state === "denied" ? (
        <small>Notificações estão bloqueadas nas configurações do navegador.</small>
      ) : (
        <button type="button" onClick={enable} disabled={state === "busy" || state === "loading"}>
          {state === "busy" || state === "loading" ? "Preparando…" : "Ativar alertas desta escola"}
        </button>
      )}

      {message ? <small>{message}</small> : null}
    </div>
  );
}
