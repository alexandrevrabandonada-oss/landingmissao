import type { Metadata } from "next";
import ReceiptWalletClient from "./ReceiptWalletClient";

export const metadata: Metadata = {
  title: "Meus recibos — Climatização",
  description: "Carteira local de recibos anônimos da plataforma de climatização.",
  robots: { index: false, follow: false },
};

export default function ReceiptWalletPage() {
  return <ReceiptWalletClient />;
}
