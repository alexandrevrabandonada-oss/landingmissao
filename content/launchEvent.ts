import { SITE_IDENTITY } from "@/src/content/siteIdentity";

/**
 * Configuração central da página pública da pré-campanha.
 *
 * ➜ Atualize este arquivo quando frentes, links e WhatsApp forem confirmados.
 *   Não edite o componente da página — edite apenas aqui.
 *
 * ATENÇÃO ELEITORAL:
 * Não inserir pedidos de voto, número de candidato ou qualificação de candidato oficial.
 * Este arquivo é exclusivo para organização de pré-campanha.
 */

export const launchEvent = {
  // ── Hero ───────────────────────────────────────────────────────────────────
  eyebrow: SITE_IDENTITY.contextLabel,
  title: SITE_IDENTITY.mainPhrase,
  subtitle:
    `No App ${SITE_IDENTITY.appName}, a pré-campanha vira ferramenta: missão, formação, território, convite e ação coletiva.`,
  badge: SITE_IDENTITY.fullLabel,
  signature: SITE_IDENTITY.signature,

  // ── CTAs ───────────────────────────────────────────────────────────────────
  /** Caminho interno do app para cadastro. Troque pela URL real quando o app estiver publicado. */
  appSignupPath: "#cadastro",

  /** Número do WhatsApp com DDI, sem espaços ou símbolos. Ex: "5524999998888". Deixar vazio para ocultar o botão. */
  whatsappNumber: "",

  // ── Frentes de organização ─────────────────────────────────────────────────
  whatWillHappen: [
    {
      icon: "🧭",
      title: "Direção política da pré-campanha",
      description:
        "A pré-campanha organiza escuta, presença territorial e ação coletiva em Volta Redonda.",
    },
    {
      icon: "📱",
      title: "App Missão ÉLuta",
      description:
        "O app concentra cadastro, missões, formação e acompanhamento da organização de base.",
    },
    {
      icon: "🤝",
      title: "Convite para voluntários e apoiadores",
      description:
        "Quem quiser participar entra no grupo, recebe orientação e encontra um próximo passo possível.",
    },
    {
      icon: "🗺️",
      title: "Organização por território, pauta e missão",
      description:
        "A base começa a se organizar por bairro, demanda e capacidade de ação.",
    },
  ],

  // ── Por que isso é diferente ───────────────────────────────────────────────
  whyDifferent:
    "Não é só divulgar uma pré-campanha. É criar uma ferramenta de organização: " +
    "cada pessoa entra, recebe uma missão possível, aprende, compartilha e chama mais gente.",

  // ── Como o app funciona ────────────────────────────────────────────────────
  appSteps: [
    {
      number: "01",
      title: "Entrar",
      description:
        "Acesse o App Missão ÉLuta, crie seu perfil e informe seu bairro.",
    },
    {
      number: "02",
      title: "Escolher uma missão",
      description:
        "Receba missões do tamanho certo: conversa, registro, convite, presença.",
    },
    {
      number: "03",
      title: "Registrar ação",
      description:
        "Anote o que você fez, onde e com quem. O mapa de base cresce.",
    },
    {
      number: "04",
      title: "Compartilhar e convidar",
      description:
        "Leve mais pessoas. Cada convite fortalece o território.",
    },
  ],

  // ── Compartilhamento ───────────────────────────────────────────────────────
  /** Domínio curto exibido no card de compartilhamento. */
  publicUrlLabel: "alexandrevrabandonada.online",

  shareText:
    "Conheça a pré-campanha Alexandre VR Abandonada e o app Missão ÉLuta.\n\n" +
    "A ideia é transformar escuta em organização popular.\n\n" +
    "Escutar • Cuidar • Organizar.\n\n" +
    "Vem conhecer: [LINK]",

  // ── Perguntas frequentes ───────────────────────────────────────────────────
  faqs: [
    {
      question: "Precisa ser filiado a algum partido?",
      answer:
        "Não. A pré-campanha é aberta a qualquer pessoa que queira participar da organização popular, independente de filiação.",
    },
    {
      question: "Precisa saber usar tecnologia?",
      answer:
        "Não. O app foi pensado para funcionar no celular básico, com linguagem simples. Quem tiver dificuldade recebe apoio da organização.",
    },
    {
      question: "Posso só conhecer, sem me comprometer?",
      answer:
        "Sim. Você pode entrar no grupo, acompanhar os materiais e decidir no seu tempo qual passo quer dar.",
    },
    {
      question: "O app já está funcionando?",
      answer:
        "Sim. O App Missão ÉLuta é o ponto de entrada para cadastro, missões, formação e organização da pré-campanha.",
    },
    {
      question: "Como posso ajudar a organizar?",
      answer:
        "Compartilhe a página, entre no grupo de voluntários, acesse o app e escolha uma ação concreta. Cada pessoa que chega já fortalece a rede.",
    },
  ],
} as const;

export type LaunchEventConfig = typeof launchEvent;
