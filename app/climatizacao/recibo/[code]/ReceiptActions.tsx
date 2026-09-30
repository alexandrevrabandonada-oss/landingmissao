"use client";

import { useState } from "react";
import styles from "./receipt.module.css";

export default function ReceiptActions({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    const fn = (navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    }).share;

    if (fn) {
      await fn.call(navigator, {
        title: "Recibo público — Climatização nas escolas",
        text: "Este recibo confirma que uma participação foi registrada na plataforma pública de climatização.",
        url,
      }).catch(() => undefined);
      return;
    }

    await copy();
  }

  return (
    <div className={styles.actions}>
      <button type="button" onClick={copy}>{copied ? "Link copiado" : "Copiar link do recibo"}</button>
      <button type="button" onClick={share}>Compartilhar recibo</button>
    </div>
  );
}
