# Estado da Nação - Runner Mobile DIAG

Data: 2026-05-15

## Escopo

Este documento cobre apenas diagnóstico técnico e plano de implementação para uma segunda versão do mini-jogo da Landing Missao, provisoriamente chamada `Missão ÉLuta: Rua em Movimento`.

Não houve:

- implementação de rota
- instalação de dependência
- alteração de backend
- criação de ranking
- coleta de dado pessoal

## DIAG do jogo atual

### Estrutura atual de `/jogo`

Arquitetura identificada:

- rota pública em `app/jogo/page.tsx`
- carregamento client-only em `app/jogo/GameEntry.tsx`
- runtime principal em `src/features/game/GameExperience.tsx`
- assets em `public/game/*`
- share/tracking em `src/lib/shareLaunch.ts` e `src/lib/trackEvent.ts`
- links do app em `src/content/siteLinks.ts`

Pontos fortes do arranjo atual:

- jogo isolado da landing institucional
- lazy-load do runtime só na rota do jogo
- preservação de `ref`
- UTMs consistentes
- tela final com share e CTA para o app

Pontos que não devem ser reaproveitados como estão:

- `GameExperience.tsx` concentra loop, física, HUD e tela final em um arquivo só
- input atual foi pensado para plataforma lateral, não para swipe runner
- o layout atual é mais horizontal do que mobile-first

### Share e tracking reaproveitáveis

Podem ser reaproveitados sem arquitetura nova:

- `buildTrackedPath`
- `buildGamePath`
- `buildGameShareMessage`
- `buildLaunchWhatsAppUrl`
- `buildFacebookShareUrl`
- `copyToClipboardSafe`
- `trackEventIfAvailable`
- `buildGameAppBaseUrl`
- `buildGameAppSignupUrl`
- `buildGameAppMissoesUrl`

Conclusão:

- o runner novo não deve inventar outro sistema de share
- o ideal é estender a convenção atual para uma rota irmã do jogo já existente

### Assets reaproveitáveis

Podem ser reaproveitados total ou parcialmente:

- `public/game/layer-sky.svg`
- `public/game/layer-serras.svg`
- `public/game/layer-rio.svg`
- `public/game/layer-industrial.svg`
- `public/game/layer-concreto.svg`
- `public/game/finish-city.svg`
- coletáveis atuais como base visual
- personagem atual em `player-idle.png`, `player-run.png`, `player-jump.png` como referência inicial

Não faz sentido reaproveitar diretamente:

- lógica visual de plataforma lateral
- distribuição de obstáculos por altura do jogo atual

## Decisão de rota

### Recomendação

Criar `app/jogo/rua/page.tsx`.

### Motivo da decisão

`/jogo/rua` é melhor que `/jogo-rua` porque:

- preserva a família de rotas do domínio “jogo”
- facilita metadata, share e analytics com convenção consistente
- permite futuramente conviver com outras variantes como `/jogo/base`, `/jogo/escuta`, `/jogo/rua`
- mantém a landing simples: teaser aponta para uma subrota sem duplicar semântica

Conclusão objetiva:

- manter `/jogo` como jogo legado de plataforma
- criar `/jogo/rua` para o runner mobile-first

## Arquitetura sugerida

### Separação de runtime

O runner novo deve ter runtime separado do jogo antigo.

Estrutura sugerida:

- `app/jogo/rua/page.tsx`
- `app/jogo/rua/GameRuaEntry.tsx`
- `src/features/game-rua/GameRuaExperience.tsx`
- `src/features/game-rua/core/*`
- `src/features/game-rua/ui/*`
- `src/features/game-rua/content/*`

Regra importante:

- não acoplar o runner novo ao `GameExperience.tsx` atual
- compartilhar só utilitários de share, tracking e links

### Modelo de página

`app/jogo/rua/page.tsx`:

- lê `ref`
- monta `shareUrl`
- monta links do app
- define metadata própria
- carrega o entry client-only

`GameRuaEntry.tsx`:

- `dynamic import` com `ssr: false`
- loading pequeno e mobile-friendly

`GameRuaExperience.tsx`:

- loop em canvas
- overlays em DOM/React
- swipe/touch handler local

## Controles mobile

### Modelo recomendado

Runner em 3 faixas com controle por swipe:

- swipe esquerda: troca para faixa da esquerda
- swipe direita: troca para faixa da direita
- swipe cima: salto curto
- swipe baixo: deslize/agachamento

Fallback adicional:

- toque em botões discretos de acessibilidade para quem preferir

### Por que esse modelo faz sentido

- combina melhor com uso mobile vertical
- reduz HUD intrusivo
- evita sobrecarregar a tela com três botões grandes fixos
- mantém leitura autoral se a animação, o enquadramento e o pacing forem próprios

### Teste de swipe/touch

Sem dependência nova.

Abordagem sugerida:

- usar `pointerdown`, `pointermove`, `pointerup`
- calcular delta inicial e direção dominante
- definir limiar mínimo para não registrar toque comum como swipe
- bloquear scroll vertical apenas dentro da área do jogo

## Adaptação para mobile vertical

### Canvas recomendado

Formato sugerido:

- viewport lógica vertical, por exemplo `540 x 960` ou `600 x 1066`
- composição pensada para portrait first

### Consequência de design

- câmera levemente inclinada para frente, como rua/avenida
- três trilhas/faixas marcadas no chão
- horizonte com serras e silhueta industrial
- HUD compacta no topo
- tela final ocupando a dobra útil sem exigir scroll

### Landing leve

Para manter a landing leve:

- não embutir o runner em `/lancamento`
- usar teaser estático com thumbnail
- lazy-load só em `/jogo/rua`

## Plano de componentes

Componentes sugeridos:

- `GameRuaCanvas`
- `GameRuaHud`
- `GameRuaIntro`
- `GameRuaFinishCard`
- `GameRuaTouchOverlay`
- `GameRuaPauseBar`

Core sugerido:

- `laneModel.ts`
- `spawnPlanner.ts`
- `swipeInput.ts`
- `collision.ts`
- `difficultyCurve.ts`
- `shareResult.ts`

## Plano de assets

### Cenário

Camadas novas ou derivadas:

- rua/asfalto com 3 faixas
- praça/concreto lateral
- ponte/viaduto
- serras
- silhueta industrial
- postes, placas, pichação, guarda-corpo

### Coletáveis autorais

Recomendações:

- relato
- prova
- memória
- apoio popular
- escuta de rua

### Obstáculos autorais

Recomendações:

- pilha de papel/cartas de processo
- barreira móvel de concreto
- faixa bloqueada
- carimbo pendular
- portão de silêncio

### Direção visual

- preto, amarelo, ferrugem, vermelho queimado
- stencil/grafite
- concreto urbano
- referência de Volta Redonda pelo clima visual, não por marca ou logotipo

## Plano de dificuldade

Fase 1:

- só mudança de faixa
- itens fáceis e leitura ampla

Fase 2:

- introduzir salto
- padrões simples de 1 obstáculo por vez

Fase 3:

- introduzir deslize
- sequências curtas de 2 ações

Meta:

- primeira partida compreensível em menos de 10 segundos
- chance alta de sobrevivência nos primeiros 20 a 30 segundos
- partida média entre 60 e 90 segundos

## Plano de share final

### Reaproveitamento

Reaproveitar o mesmo modelo ético atual:

- Web Share API quando existir
- fallback de copiar texto
- fallback de copiar link
- botões para WhatsApp, Facebook, Instagram e TikTok por fluxo compatível

### Ajuste necessário

Criar mensagem específica do runner `Rua em Movimento`, sem reaproveitar o texto de `Corre da Burocracia`.

Estrutura sugerida:

- título textual de desempenho
- relatos coletados
- distância percorrida
- easter eggs encontrados
- link rastreado com `ref` e UTM

## Riscos de performance

- canvas portrait pode exigir mais redraw por frame em mobile baixo
- excesso de partículas degrada Android intermediário
- sprites muito grandes em PNG podem inflar memória
- múltiplas camadas de parallax em alta resolução podem elevar custo de decode

Mitigação:

- sprites compactos
- poucas camadas
- animação enxuta
- cálculo de spawn fora do React

## Riscos de propriedade intelectual

Principais riscos:

- lembrar demais jogos de runner urbano com 3 faixas
- câmera, pacing e UI parecerem cópia funcional de Subway Surfers

Mitigação:

- evitar estética adolescente/cartoon brilhante
- evitar moedas, hoverboards, trens, guardas ou perseguição policial
- evitar framing visual e HUD parecidos com franquias conhecidas
- assumir clima urbano-industrial de base popular, não fantasia pop colorida

## Riscos de pré-campanha

Evitar:

- pedido de voto
- número eleitoral
- promessa individual
- ataque a pessoa real
- linguagem de propaganda oficial

Manter:

- pré-campanha
- escuta
- cidade melhor
- organização popular
- denúncias cidadãs apenas como linguagem geral, não coleta real dentro do jogo

## Decisão final

Decisão de rota:

- criar `/jogo/rua`

Decisão de arquitetura:

- runtime separado do jogo atual
- utilitários de share, tracking e links compartilhados
- canvas mobile-first em portrait
- swipe por `pointer events`

Decisão de produto:

- runner urbano autoral de 3 faixas
- sessão curta
- share final forte
- CTA para o App Missão ÉLuta no fechamento

