"use client";

import Link from "next/link";
import styles from "./climatizacao.module.css";

export default function ReceiptBanner({
  receiptUrl,
  label,
}: {
  receiptUrl: string;
  label: string;
}) {
  return (
    <aside className={styles.receiptBanner} aria-live="polite">
      <div>
        <span>RECIBO ANÔNIMO GERADO</span>
        <strong>{label}</strong>
        <p>Guarde este link se quiser comprovar depois que sua participação entrou no sistema.</p>
      </div>
      <div className={styles.receiptLinks}>
        <Link href={receiptUrl}>Ver meu recibo →</Link>
        <Link href="/climatizacao/meus-recibos">Minha carteira local</Link>
      </div>
    </aside>
  );
}
