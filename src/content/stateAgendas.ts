export const stateAgendas = [
  {
    id: "saude",
    number: "01",
    title: "Saúde pública e cuidado regional",
    shortTitle: "Saúde e cuidado",
    cardLabel: "SAÚDE PÚBLICA E CUIDADO",
    description:
      "Escutar quem depende da rede pública e conectar atenção básica, hospitais, regulação, saúde mental e cuidado em todas as regiões.",
    focus: ["Rede estadual e regionalização", "Saúde mental e prevenção", "Valorização de quem cuida"],
    accent: "#65b9cf",
  },
  {
    id: "mobilidade",
    number: "02",
    title: "Mobilidade e direito de circular",
    shortTitle: "Mobilidade regional",
    cardLabel: "MOBILIDADE E DIREITO DE CIRCULAR",
    description:
      "Tratar deslocamento como direito: integração metropolitana e intermunicipal, tarifa, tempo de viagem e acesso ao trabalho e aos serviços.",
    focus: ["Transporte intermunicipal", "Trens, metrô, barcas e ônibus", "Integração, tarifa e acessibilidade"],
    accent: "#ffd100",
  },
  {
    id: "trabalho",
    number: "03",
    title: "Trabalho, renda e transição justa",
    shortTitle: "Trabalho e renda",
    cardLabel: "TRABALHO, RENDA E TRANSIÇÃO JUSTA",
    description:
      "Organizar desenvolvimento com direitos, formação, economia solidária e alternativas para regiões industriais, rurais, costeiras e metropolitanas.",
    focus: ["Direitos e proteção social", "Formação e economia solidária", "Transição industrial e energética justa"],
    accent: "#e66f4d",
  },
  {
    id: "educacao-cultura",
    number: "04",
    title: "Educação, ciência, cultura e juventude",
    shortTitle: "Educação e cultura",
    cardLabel: "EDUCAÇÃO, CIÊNCIA, CULTURA E JUVENTUDE",
    description:
      "Defender escola pública, permanência estudantil, ciência, cultura livre, esporte e perspectivas reais para a juventude fluminense.",
    focus: ["Rede estadual e permanência", "Cultura, esporte e formação", "Ciência, tecnologia e futuro"],
    accent: "#b890d8",
  },
  {
    id: "clima-moradia",
    number: "05",
    title: "Moradia, saneamento e justiça climática",
    shortTitle: "Moradia e clima",
    cardLabel: "MORADIA, SANEAMENTO E JUSTIÇA CLIMÁTICA",
    description:
      "Relacionar moradia digna, água, saneamento, enchentes, encostas, calor, prevenção de desastres e proteção dos territórios.",
    focus: ["Saneamento e direito à água", "Prevenção de enchentes e desastres", "Moradia e adaptação climática"],
    accent: "#9bd276",
  },
  {
    id: "direitos",
    number: "06",
    title: "Direitos, democracia e segurança cidadã",
    shortTitle: "Direitos e democracia",
    cardLabel: "DIREITOS, DEMOCRACIA E SEGURANÇA CIDADÃ",
    description:
      "Construir proteção, prevenção e acesso a direitos com participação popular, enfrentando violência, discriminação e abandono institucional.",
    focus: ["Direitos humanos e proteção", "Prevenção e segurança cidadã", "Participação e controle social"],
    accent: "#ef8c5b",
  },
] as const;

export type StateAgenda = (typeof stateAgendas)[number];
export type StateAgendaId = StateAgenda["id"];

export function getStateAgenda(agendaId: StateAgendaId | null | undefined) {
  return stateAgendas.find((agenda) => agenda.id === agendaId) ?? null;
}

export function isStateAgendaId(value: unknown): value is StateAgendaId {
  return typeof value === "string" && stateAgendas.some((agenda) => agenda.id === value);
}
