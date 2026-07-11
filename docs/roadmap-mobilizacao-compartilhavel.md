# Roadmap de mobilização compartilhável

## Norte do produto

Transformar curiosidade política em uma sequência curta e verificável:

`descobrir → escolher → assumir → compartilhar → participar → retornar`

O mundo 3D, a landing, o App Missão ÉLuta e os canais externos devem funcionar como partes do mesmo percurso. Nenhuma etapa pode depender exclusivamente de WebGL, cadastro ou exposição de dado pessoal.

## Métricas principais

- **Ativação:** visitante escolhe uma missão ou pauta.
- **Compromisso:** visitante confirma um próximo passo possível.
- **Compartilhamento útil:** cartão, resultado ou convite efetivamente acionado.
- **Mobilização:** clique qualificado para app, grupo, contribuição ou ação presencial.
- **Retorno:** pessoa volta e encontra uma nova missão ou continuidade reconhecível.

Tempo de tela, distância percorrida e abertura de painel são diagnósticos, não resultados políticos.

## Princípios de produto

1. Uma ação principal por estado; alternativas ficam secundárias.
2. Recompensa significa memória, compromisso ou construção coletiva — nunca pontos vazios.
3. A experiência rápida deve existir ao lado da exploração longa.
4. Todo resultado compartilhável deve expressar uma escolha da própria pessoa.
5. Sem ranking individual, prova social inventada, localização ou dado sensível.
6. Conteúdo factual e linguagem eleitoral exigem curadoria e revisão antes de publicação.
7. Mobile, teclado, leitor de tela, movimento reduzido e modo leve são critérios de aceite.

## Fase 0 — Fundação do funil

**Objetivo:** fazer portal e mundo reconhecerem a mesma jornada.

### Entregas

- [x] Estado local versionado para marcos, etapas e missão escolhida.
- [x] Caderno de Jornada global com uma recomendação principal.
- [x] Quatro missões compartilhadas entre landing e mundo 3D.
- [x] Plano de Ação no HUD depois da travessia.
- [x] Taxonomia única de eventos para ativação, compromisso, compartilhamento, mobilização e retorno.
- [ ] Painel de diagnóstico sem métricas de vaidade.

### Aceite

- A mesma escolha reaparece em todas as superfícies.
- Reset e sincronização não exigem conta.
- Nenhuma experiência imersiva recebe HUD global concorrente.

## Fase 1 — Compromisso compartilhável

**Objetivo:** devolver à pessoa algo que ela sente como seu, não apenas um link de campanha.

### Entregas

- [x] Missão escolhida com próximo passo explícito.
- [x] Cartão visual “Minha missão” gerado localmente.
- [x] Compartilhamento nativo com arquivo em navegadores compatíveis.
- [x] Fallback seguro para salvar imagem e compartilhar texto rastreável.
- [x] CTA do cartão conectado ao Caderno de Jornada.

### Aceite

- Gerar o cartão exige no máximo um toque depois da escolha.
- A imagem não contém dado pessoal.
- Funciona em 360 × 800, teclado e movimento reduzido.
- A abertura do gerador não aumenta o bundle inicial da homepage.

### Implementação entregue

O cartão usa Canvas somente depois da intenção explícita, produz PNG de 1080 × 1350 e possui identidade própria para celular, rua, contribuição e compartilhamento. Ele aparece com um toque depois da seleção e também pode ser retomado pelo Caderno de Jornada. O modal usa portal, bloqueia o fundo, prende o foco, fecha com Escape, restaura o foco e não solicita nome, foto ou localização.

## Fase 2 — Entrada personalizada por pauta

**Objetivo:** trocar uma jornada única por uma experiência que responde ao que mobiliza a pessoa.

### Entregas

- [x] Escolha entre pautas editoriais estaduais reais.
- [x] Pauta persistente no Caderno, missão e cartão compartilhável.
- [x] Rota recomendada, cor e conteúdo contextual no distrito.
- [x] Resultado que combina pauta e forma de participação.
- [x] Saída “agir agora” disponível sem concluir o 3D.

### Aceite

- A escolha altera conteúdo e próximo passo, não apenas decoração.
- A pessoa entende a proposta e encontra uma ação em até 30 segundos.
- Toda pauta possui fonte, responsável editorial e revisão.

### Implementação estadual entregue

A seleção passou a trabalhar com seis frentes para todo o estado do Rio de Janeiro: saúde e cuidado; mobilidade; trabalho e transição justa; educação, ciência, cultura e juventude; moradia, saneamento e justiça climática; direitos, democracia e segurança cidadã. Volta Redonda permanece como origem política, enquanto a mensagem pública, o Caderno, o cartão e o distrito reconhecem a escala estadual. A Assembleia do Comum, a rota, o modo leve e a Central de Missões respondem à pauta escolhida.

## Fase 3 — Missões recorrentes

**Objetivo:** criar motivo concreto para retornar.

### Entregas

- Missão editorial semanal com duração de 1–5 minutos.
- Estados `disponível`, `em andamento`, `concluída` e `próxima`.
- Histórico local mínimo e convite para continuar no app.
- Recompensa narrativa: parte do manifesto, memória ou transformação do cenário.

### Aceite

- Sempre existe uma próxima ação clara.
- Missão expirada não gera beco sem saída.
- Recorrência não depende de notificações invasivas.

## Fase 4 — Escada de mobilização

**Objetivo:** reduzir o salto entre curiosidade e entrada em um canal político.

### Entregas

- [x] Microcompromissos antes de WhatsApp, app ou contribuição.
- [x] Caminhos distintos para conhecer, compartilhar e participar.
- [x] Confirmação clara do que acontecerá ao abrir cada canal externo.
- [x] Continuidade pós-clique quando a pessoa retorna ao portal.

### Aceite

- Nenhum CTA externo é surpresa.
- Uma pessoa interessada, mas cautelosa, encontra ação de baixo compromisso.
- A recomendação principal nunca disputa atenção com mais de duas alternativas.

## Fase 5 — Construção coletiva

**Objetivo:** comunicar organização popular pela mecânica, não por gamificação competitiva.

### Entregas

- Cenário responde simbolicamente a ações coletivas verificadas.
- Metas comunitárias editoriais, sem contadores falsos.
- Convites entre pessoas sem ranking individual.
- Memória pública das ações com moderação e consentimento.

### Aceite

- A transformação é apresentada como resultado do comum.
- Nenhuma mecânica premia exposição, disputa ou volume artificial.
- Dados publicados possuem origem e regra de moderação.

## Fase 6 — Transição pré-campanha/campanha

**Objetivo:** mudar linguagem e CTAs sem reconstruir o produto.

### Entregas

- Configuração central de estágio da campanha.
- Textos, rodapé, metadata, CTAs e avisos derivados do estágio.
- Checklist editorial e jurídico antes da ativação pública.
- Feature flags para liberar experiências gradualmente.

### Aceite

- Nenhuma referência antiga permanece depois da troca de estágio.
- Existe rollback simples.
- A publicação depende de revisão humana registrada.

## Fase 7 — Otimização orientada por resultado

**Objetivo:** melhorar mobilização sem descaracterizar a experiência.

### Entregas

- Funil por origem e dispositivo.
- Auditoria de abandono entre escolha, cartão, compartilhamento e canal externo.
- Testes pequenos de ordem, copy e disclosure.
- Orçamento contínuo de WebGL, bundle, acessibilidade e estabilidade visual.

### Aceite

- Mudanças são avaliadas por ativação e mobilização, não apenas clique.
- Nenhum experimento inventa urgência ou prova social.
- Modo leve continua funcionalmente equivalente.

## Ordem de execução recomendada

1. Concluir Fase 1.
2. Implementar escolha por pauta da Fase 2.
3. Criar a escada de mobilização da Fase 4.
4. Publicar o primeiro ciclo recorrente da Fase 3.
5. Preparar configuração de estágio da Fase 6.
6. Só então ampliar mecânicas coletivas e novas áreas 3D da Fase 5.
7. Medir e ajustar continuamente pela Fase 7.

Essa ordem evita expandir o mundo antes de provar que a jornada gera compromisso, compartilhamento e participação.
