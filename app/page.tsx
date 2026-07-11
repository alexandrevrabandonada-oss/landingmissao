import type { Metadata } from "next";
import Image from "next/image";
import { launchEvent as e } from "@/content/launchEvent";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { MissionJourneyProvider } from "@/src/components/home/MissionJourney";
import { MissionProgress } from "@/src/components/home/MissionProgress";
import { MissionSelector } from "@/src/components/home/MissionSelector";
import { ShareMissionActions } from "@/src/components/home/ShareMissionActions";
import { buildMissionOptions } from "@/src/content/missions";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, publicAssetUrl, SEO_IMAGES, SITE_URL } from "@/src/content/siteSeo";
import {
  buildAppBaseUrl,
  buildDonationUrl,
  buildGamesHubUrl,
  buildVolunteerGroupUrl,
} from "@/src/content/siteLinks";
import { buildLaunchUrl } from "@/src/lib/shareLaunch";
import styles from "@/src/components/home/mission-home.module.css";

const pageUrl = canonicalUrl("/");
const pageTitle = "Alexandre VR Abandonada | Pré-candidato a deputado estadual pelo Rio de Janeiro";
const pageDescription =
  `Conheça a ${SITE_IDENTITY.fullLabel}: uma construção nascida em Volta Redonda para organizar escuta, missões e participação popular em todo o estado do Rio de Janeiro.`;

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    locale: "pt_BR",
    url: pageUrl,
    images: [
      {
        url: SEO_IMAGES.preCampanha,
        width: 1200,
        height: 630,
        alt: SITE_IDENTITY.appFullLabel,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [SEO_IMAGES.preCampanha],
  },
};

const methodSteps = [
  {
    number: "01",
    title: "Escutar",
    description:
      "Ouvir bairro, trabalhador, juventude, cultura, escola, saúde, transporte e periferia.",
  },
  {
    number: "02",
    title: "Cuidar",
    description:
      "Tratar relatos com responsabilidade, sem exposição indevida e sem promessa individual.",
  },
  {
    number: "03",
    title: "Organizar",
    description:
      "Converter interesse em missão, formação, presença pública e rede de voluntários.",
  },
] as const;

export default function HomePage() {
  const ref = "";
  const participateUrl = buildVolunteerGroupUrl(ref);
  const appUrl = buildAppBaseUrl(ref);
  const donationUrl = buildDonationUrl(ref);
  const gamesUrl = buildGamesHubUrl(ref);
  const supportUrl = "/apoio";
  const sharePath = buildLaunchUrl(
    "/?utm_source=landing&utm_medium=share&utm_campaign=pre_campanha_alexandre_vr_abandonada",
    ref,
  );

  const missions = buildMissionOptions(ref);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_IDENTITY.publicName,
    url: pageUrl,
    image: publicAssetUrl("/alexandre-retrato-hero.webp"),
    description:
      "Pré-candidato a deputado estadual ligado à organização popular, com origem em Volta Redonda e escuta territorial em todo o estado do Rio de Janeiro.",
    knowsAbout: [
      "Estado do Rio de Janeiro",
      "Volta Redonda",
      "organização popular",
      "escuta territorial",
      SITE_IDENTITY.appName,
    ],
    jobTitle: "Pré-candidato a deputado estadual",
    homeLocation: { "@type": "Place", name: "Volta Redonda, RJ" },
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_IDENTITY.fullLabel,
    description: pageDescription,
    url: pageUrl,
    image: publicAssetUrl(SEO_IMAGES.preCampanha),
    areaServed: "Estado do Rio de Janeiro",
    slogan: SITE_IDENTITY.signature,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pré-campanha", item: pageUrl },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: e.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <MissionJourneyProvider>
      <JsonLd data={[personJsonLd, organizationJsonLd, breadcrumbJsonLd, faqJsonLd]} />
      <MissionProgress participateUrl={participateUrl} />

      <div className={styles.page}>
        <section
          className={styles.hero}
          id="conhecer"
          data-journey-phase="conhecer"
          aria-labelledby="hero-title"
        >
          <div className={styles.heroAtmosphere} aria-hidden="true" />
          <div className={styles.heroContainer}>
            <div className={styles.heroCopy}>
              <h1 id="hero-title">
                Alexandre VR Abandonada pré-candidato a deputado estadual pelo Rio de Janeiro.
              </h1>
              <p className={styles.heroLead}>
                Uma pré-campanha organizada por escuta, tecnologia popular e ação de base.
              </p>
              <div className={styles.heroActions} role="group" aria-label="Ações iniciais">
                <a href="/explorar" className={styles.primaryButton}>
                  <span>Explorar o mundo 3D</span>
                  <ArrowIcon />
                </a>
                <a href="#escolher-missao" className={styles.secondaryButton}>
                  <span>Escolher minha missão</span>
                  <ArrowIcon />
                </a>
              </div>
              <p className={styles.openMission}>
                <span aria-hidden="true" />
                <strong>Missão aberta</strong>
                <i aria-hidden="true">·</i>
                Conectar as lutas do estado a partir dos territórios
              </p>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.portraitFrame}>
                <Image
                  src="/alexandre-retrato-hero.webp"
                  alt="Retrato de Alexandre VR Abandonada em composição editorial"
                  width={1024}
                  height={1024}
                  priority
                  quality={70}
                  fetchPriority="high"
                  sizes="(max-width: 700px) 100vw, (max-width: 1000px) 48vw, 460px"
                  className={styles.portrait}
                />
              </div>
            </div>
          </div>
        </section>

        <MissionSelector missions={missions} />

        <section className={`${styles.section} ${styles.identitySection}`} id="quem-e" aria-labelledby="identity-title">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionIndex}>Quem é Alexandre</p>
              <h2 id="identity-title">Nascida em Volta Redonda, conectada às lutas de todo o estado.</h2>
            </div>
            <div className={styles.identityGrid}>
              <div className={styles.identityCopy}>
                <p>
                  Alexandre VR Abandonada se apresenta como pré-candidato a deputado estadual a
                  partir de uma construção pública ligada à cidade e aberta às pessoas, regiões e
                  movimentos que vivem os problemas concretos do estado do Rio de Janeiro.
                </p>
                <p>
                  A proposta aproxima quem quer participar de tarefas possíveis, sem exigir
                  filiação, experiência anterior ou domínio de tecnologia.
                </p>
                <a href="/quem-e-alexandre-vr-abandonada" className={styles.textLink}>
                  Ler o perfil completo <ArrowIcon />
                </a>
              </div>
              <blockquote className={styles.identityQuote}>
                <p>“A landing chama. O app organiza. A rua confirma.”</p>
                <footer>{SITE_IDENTITY.signature}</footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.methodSection}`} id="metodo" aria-labelledby="method-title">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionIndex}>Método público</p>
              <h2 id="method-title">Escutar, cuidar e organizar.</h2>
              <p>Três movimentos para transformar interesse em presença e ação coletiva.</p>
            </div>
            <ol className={styles.methodList}>
              {methodSteps.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.appSection}`}
          id="como-funciona"
          data-journey-phase="entender"
          aria-labelledby="app-title"
        >
          <div className={styles.container}>
            <div className={styles.appIntro}>
              <div className={styles.sectionHeading}>
                <p className={styles.sectionIndex}>03 · Ver como funciona</p>
                <h2 id="app-title">O App Missão ÉLuta transforma interesse em tarefa.</h2>
                <p>
                  Entre, escolha uma missão possível, registre a ação e chame mais gente para o território.
                </p>
              </div>
              <a href={appUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
                <span>Conhecer o App Missão ÉLuta</span>
                <ArrowIcon />
              </a>
            </div>
            <ol className={styles.appSteps}>
              {e.appSteps.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${styles.section} ${styles.channelsSection}`} aria-labelledby="channels-title">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionIndex}>Canais disponíveis agora</p>
              <h2 id="channels-title">Cada ferramenta leva a um próximo passo real.</h2>
              <p>Sem contadores inventados: apenas caminhos públicos que já podem ser acessados.</p>
            </div>
            <div className={styles.channelList}>
              <a href={participateUrl} target="_blank" rel="noopener noreferrer">
                <span>01</span><strong>Grupo de voluntários</strong><p>Orientação e ações presenciais.</p><ArrowIcon />
              </a>
              <a href={appUrl} target="_blank" rel="noopener noreferrer">
                <span>02</span><strong>App Missão ÉLuta</strong><p>Cadastro, formação e missões.</p><ArrowIcon />
              </a>
              <a href={supportUrl}>
                <span>03</span><strong>Foto de apoio</strong><p>Ferramenta local, sem envio da foto.</p><ArrowIcon />
              </a>
              <a href="/pautas">
                <span>04</span><strong>Pautas estaduais em escuta</strong><p>Prioridades conectadas aos diferentes territórios do Rio.</p><ArrowIcon />
              </a>
              <a href={gamesUrl} target="_blank" rel="noopener noreferrer">
                <span>05</span><strong>Abandonada Games</strong><p>Experiências interativas no hub externo.</p><ArrowIcon />
              </a>
              <a href="/explorar">
                <span>06</span><strong>Explorar o território</strong><p>Caminhe entre a fábrica, a memória e o jardim.</p><ArrowIcon />
              </a>
            </div>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.actionSection}`}
          id="agir"
          data-journey-phase="agir"
          aria-labelledby="action-title"
        >
          <div className={styles.container}>
            <div className={styles.actionGrid}>
              <div className={styles.actionPanel}>
                <p className={styles.sectionIndex}>04 · Agir e compartilhar</p>
                <h2 id="action-title">Sua próxima ação pode começar agora.</h2>
                <p>
                  Entre no grupo, acesse o app ou compartilhe a página com alguém que também queira conhecer.
                </p>
                <div className={styles.actionButtons}>
                  <a href={participateUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
                    <span>Participar da pré-campanha</span><ArrowIcon />
                  </a>
                  <a href={appUrl} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
                    <span>Entrar no app</span><ArrowIcon />
                  </a>
                </div>
                <ShareMissionActions sharePath={sharePath} siteOrigin={SITE_URL} />
                <div className={styles.supportLinks}>
                  <a href={supportUrl}>Criar foto de apoio</a>
                  <a href={donationUrl} target="_blank" rel="noopener noreferrer">Contribuir com a vaquinha</a>
                </div>
              </div>

              <div className={styles.faqPanel}>
                <p className={styles.sectionIndex}>Dúvidas comuns</p>
                <div className={styles.faqList}>
                  {e.faqs.map((faq) => (
                    <details key={faq.question}>
                      <summary>
                        <span>{faq.question}</span>
                        <ChevronIcon />
                      </summary>
                      <p>{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div>
            <strong>{SITE_IDENTITY.appName}</strong>
            <p>{SITE_IDENTITY.signature}</p>
          </div>
          <nav aria-label="Links principais">
            <a href="/quem-e-alexandre-vr-abandonada">Quem é Alexandre</a>
            <a href="/pre-campanha-volta-redonda">Pré-campanha em Volta Redonda</a>
            <a href="/missao-eluta">App Missão ÉLuta</a>
            <a href="/pautas">Pautas</a>
            <a href="/perguntas-frequentes">Perguntas frequentes</a>
            <a href="/metodo">Método</a>
            <a href="/apoio">Foto de apoio</a>
          </nav>
          <p className={styles.legal}>
            Esta página é de organização de pré-campanha. Não constitui pedido de voto nem
            publicidade eleitoral nos termos da legislação vigente.
          </p>
        </div>
      </footer>
    </MissionJourneyProvider>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
