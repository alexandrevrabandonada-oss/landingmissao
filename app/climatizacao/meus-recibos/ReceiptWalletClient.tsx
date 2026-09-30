"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./wallet.module.css";

type ReceiptEntry = {
  code: string;
  url: string;
  label: string;
  saved_at: string;
};

const KEY = "climatizacao_receipts_v1";

function readReceipts(): ReceiptEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ReceiptWalletClient() {
  const [receipts, setReceipts] = useState<ReceiptEntry[]>([]);

  useEffect(() => {
    setReceipts(readReceipts());
  }, []);

  function persist(next: ReceiptEntry[]) {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setReceipts(next);
  }

  function remove(code: string) {
    persist(receipts.filter((item) => item.code !== code));
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Link href="/climatizacao" className={styles.back}>← Painel geral</Link>
        <span>CARTEIRA LOCAL</span>
        <h1>Meus recibos</h1>
        <p>
          Esta lista existe somente neste navegador. Ela não é enviada ao servidor e não cria perfil pessoal.
        </p>
      </section>

      {receipts.length === 0 ? (
        <div className={styles.empty}>
          Nenhum recibo foi guardado neste aparelho ainda. Depois de apoiar, assinar ou relatar, o recibo aparece aqui.
        </div>
      ) : (
        <section className={styles.list}>
          {receipts.map((receipt) => (
            <article key={receipt.code}>
              <div>
                <span>{receipt.label}</span>
                <strong>{receipt.code}</strong>
                <small>
                  Guardado em {receipt.saved_at ? new Date(receipt.saved_at).toLocaleString("pt-BR") : "data não disponível"}
                </small>
              </div>
              <div className={styles.actions}>
                <Link href={receipt.url}>Verificar recibo</Link>
                <button type="button" onClick={() => remove(receipt.code)}>Remover deste aparelho</button>
              </div>
            </article>
          ))}
          <button type="button" className={styles.clear} onClick={() => persist([])}>Limpar carteira local</button>
        </section>
      )}
    </main>
  );
}
