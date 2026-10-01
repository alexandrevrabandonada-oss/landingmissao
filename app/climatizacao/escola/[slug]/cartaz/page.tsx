import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";
import styles from "./poster.module.css";

const SITE="https://www.alexandrevrabandonada.online";

type School={id:number;slug:string;name:string;network:string;category:string;report_count:number;support_count:number};
type Snapshot={schools?:School[]};

async function getSchool(slug:string):Promise<School|null>{
  try{
    const r=await fetch(SITE+"/api/climatizacao?action=snapshot",{cache:"no-store"});
    if(!r.ok) return null;
    const p:Snapshot=await r.json();
    return (p.schools||[]).find(s=>s.slug===slug)||null;
  }catch{return null;}
}

export const dynamic="force-dynamic";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const school=await getSchool(slug);
  return {
    title: school ? `Cartaz de climatização — ${school.name}` : "Cartaz de climatização",
    robots:{index:false,follow:false},
  };
}

export default async function PosterPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const school=await getSchool(slug);
  if(!school) notFound();

  const qr=`/api/climatizacao/qr?escola=${encodeURIComponent(school.slug)}`;
  const short=`alexandrevrabandonada.online/c/${school.id}`;

  return <main className={styles.page}>
    <div className={styles.toolbar}>
      <Link href={`/climatizacao/escola/${school.slug}`}>← Voltar para a escola</Link>
      <PrintButton/>
    </div>

    <section className={styles.poster}>
      <div className={styles.top}>
        <span>CLIMATIZAÇÃO NAS ESCOLAS</span>
        <b>{school.network}</b>
      </div>

      <div className={styles.school}>
        <small>REGISTRE A SITUAÇÃO DESTA UNIDADE</small>
        <h1>{school.name}</h1>
        <p>{school.category}</p>
      </div>

      <div className={styles.body}>
        <div className={styles.instructions}>
          <h2>Aponte a câmera.</h2>
          <ol>
            <li>Abra a página desta escola.</li>
            <li>Registre a situação ou manifeste apoio.</li>
            <li>Acompanhe dados, evidências e respostas públicas.</li>
          </ol>
          <div className={styles.counts}>
            <span><strong>{school.report_count||0}</strong> relato(s)</span>
            <span><strong>{school.support_count||0}</strong> apoio(s) ligados à escola</span>
          </div>
        </div>

        <div className={styles.qrBox}>
          <img src={qr} alt="" />
          <strong>{short}</strong>
        </div>
      </div>

      <div className={styles.footer}>
        <strong>Informação pública, participação e acompanhamento.</strong>
        <span>Relatos comunitários são identificados como relatos e não substituem vistoria técnica.</span>
      </div>
    </section>
  </main>;
}
