import type { Metadata } from "next";
import PrivacyCenterClient from "./PrivacyCenterClient";

export const metadata:Metadata={
  title:"Centro de privacidade — Climatização",
  description:"Inspecione, exporte e apague os dados locais da plataforma de climatização.",
  robots:{index:false,follow:false},
};

export default function PrivacyPage(){
  return <PrivacyCenterClient/>;
}
