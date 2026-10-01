"use client";

import { useEffect, useState } from "react";
import styles from "./climatizacao.module.css";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallAppButton(){
  const [installEvent,setInstallEvent]=useState<BeforeInstallPromptEvent|null>(null);
  const [installed,setInstalled]=useState(false);

  useEffect(()=>{
    if(window.matchMedia("(display-mode: standalone)").matches){
      setInstalled(true);
      return;
    }

    const handler=(raw:Event)=>{
      raw.preventDefault();
      setInstallEvent(raw as BeforeInstallPromptEvent);
    };
    const done=()=>{setInstalled(true);setInstallEvent(null);};

    window.addEventListener("beforeinstallprompt",handler);
    window.addEventListener("appinstalled",done);
    return ()=>{
      window.removeEventListener("beforeinstallprompt",handler);
      window.removeEventListener("appinstalled",done);
    };
  },[]);

  if(installed||!installEvent) return null;

  async function install(){
    if(!installEvent) return;
    await installEvent.prompt();
    const choice=await installEvent.userChoice.catch(()=>null);
    if(choice?.outcome==="accepted") setInstallEvent(null);
  }

  return <button type="button" onClick={install} className={styles.installButton}>
    Instalar no aparelho
  </button>;
}
