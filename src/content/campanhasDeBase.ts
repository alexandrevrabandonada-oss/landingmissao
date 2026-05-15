export interface CampanhaReferencia {
  nome: string;
  pais: string;
  afinidadeIdeologica: string;
  oQueDeuCerto: string;
  riscoOuLimite: string;
  adaptacaoMissaoEluta: string;
  cuidadoJuridicoBrasil: string;
}

export interface MatrizAplicacao {
  eixo: string;
  copiar: string;
  evitar: string;
  implementar: string;
}

export const campanhasDeBaseContent = {
  titulo: "Laboratório de Campanhas de Base",
  subtitulo:
    "Referências internacionais transformadas em metodologia prática de pré-campanha, organização popular, escuta, território, missão e participação.",
  avisoLegal:
    "Este material é de formação política e organização de pré-campanha, respeitando a legislação eleitoral brasileira.",
  referencias: [
    {
      nome: "Barcelona en Comu",
      pais: "Espanha",
      afinidadeIdeologica: "Municipalismo progressista, movimentos urbanos e democracia de proximidade",
      oQueDeuCerto:
        "Conectar pauta concreta de cidade com organização territorial de base e narrativa cidadã.",
      riscoOuLimite:
        "Burocratização rápida e distanciamento da base quando a gestão institucional cresce.",
      adaptacaoMissaoEluta:
        "Mapear problemas por bairro, registrar escutas no app e devolver plano de ação local em ciclos curtos.",
      cuidadoJuridicoBrasil:
        "Tratar como formação e mobilização social, sem pedido explícito de voto ou publicidade antecipada.",
    },
    {
      nome: "Decidim",
      pais: "Espanha",
      afinidadeIdeologica: "Democracia participativa digital e governança aberta",
      oQueDeuCerto:
        "Plataforma com regras públicas de proposta, deliberação e devolutiva para a comunidade.",
      riscoOuLimite:
        "Participação desigual quando só grupos já organizados conseguem influenciar o processo.",
      adaptacaoMissaoEluta:
        "Criar trilhas de missão no app com propostas de bairro e devolutiva simples para cada contribuição.",
      cuidadoJuridicoBrasil:
        "Não prometer benefício individual e manter transparência sobre objetivo de formação e organização.",
    },
    {
      nome: "CUP",
      pais: "Espanha",
      afinidadeIdeologica: "Assemblearismo de base e municipalismo de confronto programático",
      oQueDeuCerto:
        "Disciplina de núcleo local, formação contínua e coerência entre discurso e prática territorial.",
      riscoOuLimite:
        "Baixa capilaridade fora de nichos politizados quando a linguagem fica muito fechada.",
      adaptacaoMissaoEluta:
        "Rituais curtos de encontro por território com linguagem popular e tarefas práticas no app.",
      cuidadoJuridicoBrasil:
        "Evitar personalização eleitoral e manter foco em participação cívica e pré-campanha de base.",
    },
    {
      nome: "Orcamento Participativo de Porto Alegre",
      pais: "Brasil",
      afinidadeIdeologica: "Democracia direta local e participação popular institucional",
      oQueDeuCerto:
        "Método de escuta e priorização coletiva com legitimidade social e regras claras.",
      riscoOuLimite:
        "Perda de ritmo quando a devolutiva institucional demora e frustra a participação.",
      adaptacaoMissaoEluta:
        "No app, criar quadro de demandas por bairro com status público e retorno periódico.",
      cuidadoJuridicoBrasil:
        "Não vincular demandas a promessa pessoal de vantagem; manter tratamento coletivo e transparente.",
    },
    {
      nome: "Zapatismo civil / Outra Campanha",
      pais: "Mexico",
      afinidadeIdeologica: "Autonomia comunitária, escuta radical e organização de longo prazo",
      oQueDeuCerto:
        "Capacidade de organizar narrativas de dignidade com base comunitária e educação política.",
      riscoOuLimite:
        "Dificuldade de escala urbana rápida sem instrumentos digitais e coordenação mais ampla.",
      adaptacaoMissaoEluta:
        "Priorizar escuta ativa, missão de cuidado e círculos de formação popular em território.",
      cuidadoJuridicoBrasil:
        "Manter o material como formação política, sem simular estrutura eleitoral oficial ou atacar adversários.",
    },
    {
      nome: "Bernie Sanders",
      pais: "Estados Unidos",
      afinidadeIdeologica: "Progressismo de massa com organização voluntária distribuída",
      oQueDeuCerto:
        "Escala de voluntariado com treinamento padrão, meta objetiva e comunicação digital intensa.",
      riscoOuLimite:
        "Fadiga de base quando metas são altas sem suporte territorial contínuo.",
      adaptacaoMissaoEluta:
        "Padronizar missão por nível de entrada e acompanhar progressão da pessoa no app.",
      cuidadoJuridicoBrasil:
        "Evitar linguagem de captação eleitoral direta; reforçar pré-campanha, formação e participação.",
    },
    {
      nome: "Momentum",
      pais: "Reino Unido",
      afinidadeIdeologica: "Mobilização digital de base com ação de rua coordenada",
      oQueDeuCerto:
        "Integração entre rede online, formação rápida e ações territoriais de alto engajamento.",
      riscoOuLimite:
        "Ruído interno e disputa narrativa quando falta mediação política consistente.",
      adaptacaoMissaoEluta:
        "Combinar alertas de missão no app com debates curtos e tarefas de território bem definidas.",
      cuidadoJuridicoBrasil:
        "Não usar conteúdo de ataque pessoal nem desinformação; manter foco pedagógico e organizativo.",
    },
    {
      nome: "La France Insoumise",
      pais: "Franca",
      afinidadeIdeologica: "Movimento com núcleos locais e comunicação programática",
      oQueDeuCerto:
        "Criar identidade coletiva forte com materiais de formação e capilaridade territorial.",
      riscoOuLimite:
        "Dependência excessiva de liderança central e menor autonomia de base em alguns ciclos.",
      adaptacaoMissaoEluta:
        "Fortalecer núcleos por território e autonomia de missão com roteiro comum no app.",
      cuidadoJuridicoBrasil:
        "Garantir que materiais sejam de formação e pré-campanha, sem pedido explícito de voto.",
    },
  ] as CampanhaReferencia[],
  matriz: [
    {
      eixo: "Escuta e territorio",
      copiar: "Escuta recorrente com devolutiva visivel para a comunidade.",
      evitar: "Coletar demanda sem retorno e sem criterio de prioridade.",
      implementar: "Checklist de escuta no app + painel de status por bairro.",
    },
    {
      eixo: "Formacao e entrada",
      copiar: "Trilhas simples para quem esta chegando agora.",
      evitar: "Linguagem fechada que afasta quem nunca participou.",
      implementar: "Modulo introdutorio + missoes de baixa barreira em 7 dias.",
    },
    {
      eixo: "Participacao digital",
      copiar: "Ferramenta aberta para propor, comentar e priorizar.",
      evitar: "Plataforma sem moderacao e sem regra de convivencia.",
      implementar: "Debates guiados no app com mediacao e sintese semanal.",
    },
    {
      eixo: "Mobilizacao",
      copiar: "Convite em cadeia com meta concreta e acompanhamento.",
      evitar: "Disparo sem contexto, queima de base e fadiga.",
      implementar: "Missão \"chamar mais 3\" com retorno de impacto por território.",
    },
  ] as MatrizAplicacao[],
} as const;

export type CampanhasDeBaseContent = typeof campanhasDeBaseContent;
