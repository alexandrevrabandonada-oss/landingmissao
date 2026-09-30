import type { Metadata } from "next";
import FollowedSchoolsClient from "./FollowedSchoolsClient";

export const metadata: Metadata = {
  title: "Minhas escolas — Climatização",
  description: "Acompanhe localmente as escolas que você escolheu seguir.",
  robots: { index: false, follow: false },
};

export default function FollowedSchoolsPage() {
  return <FollowedSchoolsClient />;
}
