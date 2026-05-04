/**
 * Configuração central do evento de lançamento da pré-campanha.
 *
 * ➜ Atualize este arquivo quando datas, local e WhatsApp forem confirmados.
 *   Não edite o componente da página — edite apenas aqui.
 *
 * ATENÇÃO ELEITORAL:
 * Não inserir pedidos de voto, número de candidato ou qualificação de candidato oficial.
 * Este arquivo é exclusivo para organização de pré-campanha.
 */

export const launchEvent = {
  // ── Hero ───────────────────────────────────────────────────────────────────
  eyebrow: "LANÇAMENTO DA PRÉ-CAMPANHA + APP",
  title: "A organização popular agora cabe no bolso.",
  subtitle:
    "No lançamento da Missão ÉLuta, a pré-campanha vira ferramenta: " +
    "missão, formação, território, convite e ação coletiva.",
  badge: "Alexandre VR Abandonada",
  signature: "Escutar • Cuidar • Organizar",

  // ── CTAs ───────────────────────────────────────────────────────────────────
  /** Caminho interno do app para cadastro. Troque pela URL real quando o app estiver publicado. */
  appSignupPath: "#cadastro",

  /** Número do WhatsApp com DDI, sem espaços ou símbolos. Ex: "5524999998888". Deixar vazio para ocultar o botão. */
  whatsappNumber: "",

  // ── Evento ─────────────────────────────────────────────────────────────────
  /** Data do evento. Substituir quando confirmada. Ex: "12 de julho de 2026" */
  dateLabel: "DATA_A_CONFIRMAR",
  /** Horário. Ex: "19h" */
  timeLabel: "HORARIO_A_CONFIRMAR",
  /** Nome do local. Ex: "Centro Cultural VR" */
  locationLabel: "LOCAL_A_CONFIRMAR",
  /** Endereço completo. Quando preenchido, o botão "Abrir no mapa" aparece. */
  addressLabel: "ENDERECO_A_CONFIRMAR",

  // ── O que vai acontecer ────────────────────────────────────────────────────
  whatWillHappen: [
    {
      icon: "🚀",
      title: "Lançamento público da pré-campanha",
      description:
        "A pré-campanha Alexandre VR Abandonada se apresenta formalmente para a base.",
    },
    {
      icon: "📱",
      title: "Demonstração do app Missão ÉLuta",
      description:
        "Ao vivo: como o app funciona, o que você pode fazer com ele e como entrar.",
    },
    {
      icon: "🤝",
      title: "Convite para voluntários e apoiadores",
      description:
        "Quem quiser participar recebe missão, contato e próximo passo na hora.",
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
        "Acesse o app, crie seu perfil e informe seu bairro.",
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
  shareText:
    "Vou no lançamento da Missão ÉLuta — pré-campanha Alexandre VR Abandonada.\n" +
    "Escutar • Cuidar • Organizar. #ELUTA #VRAbandona\n",

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
        "Não. O app foi pensado para funcionar no celular básico, com linguagem simples. Quem tiver dificuldade recebe apoio no evento.",
    },
    {
      question: "Posso só conhecer, sem me comprometer?",
      answer:
        "Sim. Vir ao evento já é participar. Você decide no seu tempo qual passo quer dar.",
    },
    {
      question: "O app já vai funcionar no dia do evento?",
      answer:
        "Sim. A demonstração ao vivo vai mostrar o app funcionando e quem quiser já pode fazer o cadastro durante o evento.",
    },
    {
      question: "Como posso ajudar a organizar?",
      answer:
        "Compartilhe este convite, venha ao evento e, se quiser, converse com a organização. Cada pessoa que chega já é apoio.",
    },
  ],
} as const;

export type LaunchEventConfig = typeof launchEvent;
