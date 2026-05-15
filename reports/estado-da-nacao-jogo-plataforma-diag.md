# Estado da Nação: Mini-jogo de Plataforma 2D

Data: 2026-05-14

## Escopo deste diagnóstico

Este documento cobre apenas diagnóstico técnico e plano de implementação para o mini-jogo provisoriamente chamado `Missão ÉLuta: Corre da Burocracia`.

Não houve:

- instalação de dependências
- criação de rota
- implementação de jogo
- alteração de backend
- alteração de Supabase

## DIAG do projeto

### Stack atual

- Framework: `Next.js 15.1.6`
- UI: `React 19`
- Linguagem: `TypeScript`
- Estrutura de rotas: `App Router`
- Estilo atual: CSS global e estilos por página
- Build/qualidade:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - `npm run verify`

Conclusão: a Landing Missao é hoje uma aplicação `Next.js` pública, enxuta e sem engine de jogo instalada.

### Estrutura pública identificada

Rotas existentes:

- `/` redireciona para `/lancamento`
- `/lancamento`
- `/metodo`
- `/formacao/campanhas-de-base`

Arquivos centrais:

- `app/layout.tsx`
- `app/page.tsx`
- `app/lancamento/page.tsx`
- `app/metodo/page.tsx`
- `app/formacao/campanhas-de-base/page.tsx`
- `src/content/siteIdentity.ts`
- `src/content/siteLinks.ts`
- `src/lib/shareLaunch.ts`
- `src/components/launch/LaunchActionStrip.tsx`
- `app/lancamento/ShareButtons.tsx`
- `app/lancamento/ViralBlock.tsx`

### Rota `/jogo`

Status atual: não existe rota `/jogo`.

Conclusão: o mini-jogo pode ser introduzido sem colisão com rotas já existentes.

### Assets existentes

Assets públicos identificados:

- `public/alexandre-retrato.png`
- `public/og-lancamento.svg`

Conclusão: hoje o projeto ainda não possui pasta ou convenção dedicada para assets de jogo, áudio, sprite atlas, fundos, HUD ou efeitos.

### Tracking, ref e UTM

O projeto já possui infraestrutura útil e consistente para rastreamento.

Em `src/content/siteLinks.ts`:

- preserva `ref` quando presente
- define `utm_source=landing`
- define `utm_medium` por contexto
- define `utm_campaign=pre_campanha_alexandre_vr_abandonada`

Links já existentes para o app:

- signup: `/auth?mode=signup&next=/voluntario/hoje`
- formação: `/auth?mode=signup&next=/formacao`
- missões: `/auth?mode=signup&next=/voluntario/missoes`
- debates: `/auth?mode=signup&next=/debates`
- convite: `/auth?mode=signup&next=/voluntario/convite`

Em `src/lib/shareLaunch.ts`:

- existe montagem de URL da landing com preservação de `ref`
- existe mensagem padronizada de compartilhamento via WhatsApp

Em `app/lancamento/page.tsx`:

- a página lê `ref`, `utm_source`, `utm_medium` e `utm_campaign`
- há distinção entre CTA e share

Conclusão: não faz sentido o mini-jogo criar um sistema paralelo de tracking. Ele deve estender esse padrão.

## Leitura de produto

### Papel do jogo no ecossistema

A landing é vitrine pública.

O App Missão ÉLuta é o motor organizativo.

Portanto, o mini-jogo não deve virar um produto isolado nem uma área interna falsa. Ele deve funcionar como:

- peça viral pública
- experiência curta e memorável
- mecanismo de entrada para cadastro e primeira missão no app

### Objetivo ideal do jogo

Converter curiosidade em três comportamentos:

1. jogar uma sessão curta
2. compartilhar o resultado com mais pessoas
3. entrar no App Missão ÉLuta para continuar a jornada

## Recomendação de arquitetura

### Decisão de stack para implementação futura

Recomendação: `Phaser` na fase de implementação.

Justificativa:

- é o caminho técnico mais sólido para plataforma 2D no navegador
- separa melhor cena, input, física e loop do que improvisar tudo em React
- reduz risco de acoplamento do jogo com a página institucional
- é mais seguro para performance do que montar um pseudo-engine dentro de componentes React

Alternativa não recomendada:

- implementar gameplay inteiro só com React e DOM

Razão para evitar:

- colisão, gravidade, hitboxes, câmera e timing ficariam frágeis
- aumenta custo de manutenção
- piora qualidade do jogo em mobile

### Onde o jogo deve ficar

Recomendação principal: rota dedicada `/jogo`.

Motivos:

- evita pesar a renderização inicial de `/lancamento`
- preserva a landing como página institucional de conversão
- facilita metadata própria, tracking próprio e share próprio
- permite tela cheia mobile com menos conflito com blocos da landing

O que colocar na landing:

- um bloco teaser do jogo em `/lancamento`
- CTA do tipo `Jogar a missão`
- resumo curto: “Corra da burocracia, registre sua pontuação e chame mais 3 pessoas”

O que evitar:

- embutir o canvas jogável no topo de `/lancamento`
- carregar engine de jogo junto com o hero

### Lazy-load e isolamento

Recomendação:

- rota `/jogo` como página server do App Router
- módulo do jogo como componente client-only
- engine carregada por `dynamic import` com `ssr: false`

Estrutura sugerida:

- `app/jogo/page.tsx`
- `src/features/game/GameEntry.tsx`
- `src/features/game/core/*`
- `src/features/game/ui/*`
- `src/features/game/content/*`
- `public/game/*`

Modelo:

- `page.tsx` lê `searchParams`, preserva `ref/utm`, monta metadata e shell da página
- `GameEntry.tsx` carrega a engine apenas no cliente
- HUD, tutorial, tela de pausa, game over e CTA final ficam em DOM/React
- playfield fica em canvas

### Fronteira entre simulação e UI

Recomendação obrigatória:

- simulação do jogo fora do React
- UI e overlays em React/DOM

Separação sugerida:

- `simulation`: player, obstáculos, timers, checkpoints, score, estado de derrota
- `renderer`: câmera, animação, fundo parallax, partículas, sprites
- `ui`: onboarding, HUD, botões de share, CTA para o app, modal final

Isso mantém o jogo previsível e reduz regressão quando a landing evoluir.

## Conceito de jogo recomendado

### Fantasy e verbos

Fantasy:

- atravessar uma cidade industrial congestionada por entraves e sinais de burocracia
- manter o movimento coletivo vivo
- transformar escuta em avanço

Verbos:

- correr
- pular
- abaixar ou deslizar
- coletar sinais de escuta
- desviar de entraves burocráticos

### Estrutura da sessão

Sessão ideal:

- 45 a 90 segundos
- reinício rápido
- dificuldade crescente
- resultado final com título textual e convite para compartilhar

Loop:

1. tela curta de abertura
2. tutorial de 1 tela
3. fase única infinita ou semi-infinita
4. derrota
5. tela final com score, frase e CTAs

### Direção autoral segura

Para evitar semelhança reconhecível com franquias protegidas:

- não usar blocos suspensos
- não usar moedas flutuando em fileira
- não usar power-ups tipo cogumelo
- não usar inimigos-cartoon com silhueta conhecida
- não usar castelo final
- não usar música chiptune que remeta a franquias específicas
- não usar level design de plataformas coloridas em ritmo Mario-like

Direção autoral sugerida:

- cenário urbano-industrial de Volta Redonda como referência abstrata
- passarelas, trilhos, viadutos, portões, fumaça, placas, cones, catracas, pilhas de papel, carimbos, filas e sirenes visuais
- estética `preto`, `amarelo`, `ferrugem`, `cinza aço`, stencil, textura de concreto e metal

## Preservação de ref e UTM

### Recomendação técnica

Criar futuramente builders equivalentes aos já existentes:

- `buildGameUrl(ref?: string | null)`
- `buildGameShareUrl(ref?: string | null)`
- `buildGameAppCtaUrl(ref?: string | null, medium?: string)`

Padrão recomendado:

- manter `ref` se existir
- manter `utm_campaign=pre_campanha_alexandre_vr_abandonada`
- variar `utm_medium` conforme ação

Sugestão de mediums:

- `game_teaser` para CTA da landing para `/jogo`
- `game_play` para entrada direta no jogo
- `game_finish` para CTA final do jogo para o app
- `game_share` para links compartilhados do resultado

Exemplo de fluxo:

`/lancamento?ref=joana` -> CTA “Jogar a missão” -> `/jogo?ref=joana&utm_source=landing&utm_medium=game_teaser&utm_campaign=pre_campanha_alexandre_vr_abandonada`

Ao terminar:

CTA para app preserva o mesmo `ref`:

`/auth?mode=signup&next=/voluntario/hoje&ref=joana&utm_source=landing&utm_medium=game_finish&utm_campaign=pre_campanha_alexandre_vr_abandonada`

## CTA final para o App Missão ÉLuta

O jogo deve terminar com ação clara e não eleitoral.

CTAs recomendados:

- `Entrar no app Missão ÉLuta`
- `Receber minha primeira missão`
- `Participar da pré-campanha`
- `Chamar mais 3 pessoas`

Mensagem de fechamento sugerida:

“Você passou por uma cidade travada. Agora entre no App Missão ÉLuta para transformar escuta em organização popular.”

Evitar:

- pedido de voto
- promessa individual
- linguagem de vitória eleitoral

## Share ao final do jogo

### Objetivo

O share final deve divulgar:

- o jogo
- a pré-campanha
- o app
- o convite para entrar e compartilhar

### Formato recomendado

Mensagem padrão sugerida:

“Joguei Missão ÉLuta: Corre da Burocracia.

Pré-campanha Alexandre VR Abandonada.

Escutar • Cuidar • Organizar.

Agora quero transformar escuta em organização popular.

Vem jogar e conhecer o App Missão ÉLuta: [LINK]”

O link compartilhado deve:

- apontar para `/jogo`
- preservar `ref`
- usar `utm_source=landing`
- usar `utm_medium=game_share`
- usar `utm_campaign=pre_campanha_alexandre_vr_abandonada`

### Resultado compartilhável

Além da mensagem:

- score textual
- título de desempenho autoral

Exemplos de títulos:

- `Escuta em Movimento`
- `Organizador de Rua`
- `Fôlego de Mutirão`

Evitar ranking agressivo ou linguagem de guerra eleitoral.

## Plano de assets

### Organização sugerida

Estrutura futura:

- `public/game/backgrounds/*`
- `public/game/props/*`
- `public/game/characters/*`
- `public/game/ui/*`
- `public/game/audio/*`

### Pacotes de asset necessários

1. Personagem

- corredor autoral
- idle
- run
- jump
- fall
- slide ou crouch
- hit

2. Cenários

- skyline industrial
- estruturas metálicas
- passarelas e chão modular
- camadas de parallax
- fumaça e iluminação amarela

3. Obstáculos

- pilhas de papel
- carimbos gigantes
- catracas
- grades móveis
- fitas de interdição
- barreiras de obra

4. Itens coletáveis

- ícones de escuta
- sinais de organização
- marcadores de denúncia cidadã

5. UI

- barra de progresso
- contador
- tela de tutorial
- tela de game over
- card de share

6. Áudio

- trilha original curta e repetível
- SFX autorais discretos

### Direção de produção

Recomendação:

- começar com placeholders monocromáticos autorais
- validar loop e clareza
- só depois fechar arte final

Isso reduz retrabalho e risco de estética “genérica de IA”.

## Performance e mobile

### Riscos principais

1. Peso de bundle

- engine de jogo no bundle da landing degradaria LCP e TTI

Mitigação:

- rota dedicada
- `dynamic import`
- assets de jogo fora do caminho crítico da landing

2. Mobile de entrada

- aparelhos modestos podem sofrer com canvas grande, partículas demais e parallax excessivo

Mitigação:

- resolução interna reduzida com upscale
- limite de partículas
- hitboxes simples
- no máximo 2 ou 3 camadas de parallax

3. React acoplado ao loop

- re-render por frame em React é erro arquitetural

Mitigação:

- React só para HUD e overlays
- loop do jogo fora da árvore React

4. Tamanho de imagem e áudio

- PNGs grandes e trilha não otimizada podem inflar carregamento

Mitigação:

- sprite sheets compactos
- compressão de áudio
- preload mínimo e carregamento progressivo

## Riscos de propriedade intelectual

### Riscos

- personagem lembrando mascotes existentes
- layout de fase reconhecível como Mario-like
- itens coletáveis similares a moedas
- power-ups similares a franquias conhecidas
- trilha parecida com temas famosos

### Mitigação

- direção de arte urbana-industrial própria
- mecânicas e silhuetas autorais
- nomenclatura temática local
- composição visual baseada em cidade, não em fantasia lúdica clássica

## Riscos de pré-campanha e comunicação pública

### O que deve constar

- `pré-campanha`
- `escuta`
- `denúncias cidadãs`
- `organização popular`
- `cidade melhor`

### O que deve ser evitado

- `vote`
- `eleja`
- número eleitoral
- pedido explícito de voto
- promessa de benefício individual
- ataque a pessoa real

### Recomendação editorial

O jogo deve tratar obstáculos como sistemas impessoais da cidade:

- papelada
- fila
- demora
- catraca
- abandono urbano

Não deve personificar adversário real ou partido.

## Recomendação final

### Decisão principal

Implementar futuramente como experiência separada em `/jogo`, com teaser em `/lancamento`.

### Motivo

É a opção mais forte ao mesmo tempo para:

- performance
- clareza institucional
- viralização
- tracking
- manutenção

### Roadmap sugerido

Fase 1. Base técnica

- criar rota `/jogo`
- criar shell server da página
- criar módulo client-only do jogo
- integrar leitura e repasse de `ref/utm`

Fase 2. Vertical slice

- movimento básico
- 3 obstáculos
- 1 coletável
- HUD
- game over
- CTA final

Fase 3. Viralização

- share final com score
- card compartilhável
- título de desempenho
- link rastreável

Fase 4. Polimento

- arte final
- áudio original
- ajustes de mobile
- QA de performance

## Resumo executivo

- O projeto atual é `Next.js 15 + React 19`, sem engine de jogo.
- Não existe rota `/jogo`.
- Já existe uma base consistente de `ref/UTM/share`.
- O mini-jogo não deve entrar como bloco pesado dentro de `/lancamento`.
- A melhor arquitetura é rota dedicada `/jogo` com lazy-load client-only.
- O caminho técnico recomendado para implementação futura é `Phaser`.
- O jogo deve terminar com CTA para o App Missão ÉLuta e share rastreável.
- A direção visual precisa ser urbana-industrial autoral, sem ecos reconhecíveis de franquias protegidas.
