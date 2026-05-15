# Estado da Nação: Jogo de Plataforma v0

Data: 2026-05-14

## Escopo entregue

Foi implementado o protótipo v0 jogável de `Missão ÉLuta: Corre da Burocracia` com:

- rota pública `/jogo`
- carregamento lazy-loaded
- Canvas 2D puro
- controles para PC e mobile
- share final com preservação de `ref`
- CTA final para o App Missão ÉLuta
- fallback estático para `prefers-reduced-motion`
- bloco discreto em `/lancamento`

Não houve:

- dependência nova
- backend novo
- coleta de denúncia real
- pedido de voto
- número eleitoral

## Arquivos criados

- `app/jogo/page.tsx`
- `app/jogo/GameEntry.tsx`
- `src/features/game/GameExperience.tsx`
- `public/game/player.svg`
- `public/game/background-vr.svg`
- `public/game/collect-relato.svg`
- `public/game/collect-prova.svg`
- `public/game/collect-memoria.svg`
- `public/game/collect-apoio.svg`
- `public/game/obstacle-processinho.svg`
- `public/game/obstacle-carimbo.svg`
- `public/game/obstacle-muralha.svg`
- `public/game/finish-city.svg`
- `reports/estado-da-nacao-jogo-plataforma-v0.md`

## Arquivos editados

- `app/lancamento/page.tsx`
- `src/content/siteLinks.ts`
- `src/lib/shareLaunch.ts`

## Rota criada

Nova rota pública:

- `/jogo`

Responsabilidades:

- `app/jogo/page.tsx`: shell server, metadata, leitura de `ref`, URLs de saída, share e CTAs
- `app/jogo/GameEntry.tsx`: wrapper client para lazy-load
- `src/features/game/GameExperience.tsx`: runtime, HUD, controles, estados finais e fallback estático

## Controles implementados

### PC

- `Seta esquerda` ou `A`: mover para a esquerda
- `Seta direita` ou `D`: mover para a direita
- `Espaço` ou `Seta para cima`: pular

### Mobile

Botões fixos no rodapé do jogo:

- `←`
- `→`
- `Pular`

A versão mobile foi ajustada para deixar o botão de pulo em linha própria em telas estreitas.

## Gameplay v0

Modelo entregue:

- side-scroller 2D simples com pista contínua
- corrida curta de aproximadamente `60 a 90 segundos`
- coleta de:
  - relatos
  - provas
  - memória
  - apoio popular
- obstáculos:
  - Processinho Voador
  - Carimbo da Burocracia
  - Muralha do Silêncio

Estado final:

- a cidade progride visualmente para uma versão mais organizada
- tela final exibe:
  - `Você reuniu relatos e ajudou a organizar uma cidade melhor.`
  - `Pré-campanha Alexandre VR Abandonada`
  - `Missão ÉLuta — Escutar • Cuidar • Organizar`

## Assets criados

Assets autorais em `public/game/`:

- `player.svg`
- `background-vr.svg`
- `collect-relato.svg`
- `collect-prova.svg`
- `collect-memoria.svg`
- `collect-apoio.svg`
- `obstacle-processinho.svg`
- `obstacle-carimbo.svg`
- `obstacle-muralha.svg`
- `finish-city.svg`

Direção visual:

- serras
- rio Paraíba do Sul
- silhueta industrial
- concreto urbano
- amarelo, ferrugem, preto e cinza

## Share, ref e UTM

Foram adicionados builders específicos para o fluxo do jogo.

### Preservação

- `ref` é preservado quando existe

### Share final

Link compartilhado usa:

- `utm_source=game`
- `utm_medium=share`
- `utm_campaign=pre_campanha_alexandre_vr_abandonada`

Mensagem implementada:

“Joguei a missão relâmpago da pré-campanha Alexandre VR Abandonada no app Missão ÉLuta.

Reuni relatos, desviei da burocracia e ajudei a organizar uma cidade melhor.

Escutar • Cuidar • Organizar.

Vem jogar: [LINK]”

## Integração com a landing

Foi adicionado em `/lancamento` o bloco:

- `Jogue a missão relâmpago`

CTA principal:

- `Jogar agora`

Objetivo:

- anunciar o jogo sem carregar o bundle do runtime dentro da landing
- manter a landing como vitrine e o jogo como peça viral separada

## Performance

Medidas aplicadas:

- engine feita em Canvas 2D puro, sem dependência externa
- jogo carregado apenas em `/jogo`
- runtime lazy-loaded via wrapper client
- landing não importa o componente do jogo
- assets em SVG leves
- fallback estático para `prefers-reduced-motion`

Resultado do build:

- `/jogo` aparece com carga inicial pequena e isolada do restante da landing

## Riscos evitados

### Propriedade intelectual

Evitado:

- sprites copiados
- blocos, moedas ou power-ups reconhecíveis
- level design similar a franquias conhecidas

### Pré-campanha

Evitado:

- `vote`
- `eleja`
- número eleitoral
- pedido de voto
- promessa individual
- denúncia real dentro do jogo

### Arquitetura

Evitado:

- acoplar loop do jogo à landing
- carregar engine na home pública
- usar React como loop principal de simulação

## Resultado do verify

Comando executado:

- `npm run verify`

Status:

- `typecheck`: ok
- `lint`: ok
- `build`: ok

Observação:

- o output do Next avisa que `next lint` será descontinuado no Next 16, mas isso não bloqueia a entrega atual

## Como testar em PC

1. Rodar `npm run dev`
2. Abrir `http://localhost:3000/jogo`
3. Testar movimento com `A/D` ou setas
4. Testar pulo com `Espaço`
5. Colidir com obstáculo para validar derrota
6. Completar a corrida para validar vitória
7. Clicar em:
   - `Compartilhar resultado`
   - `Entrar no app`
   - `Receber primeira missão`

## Como testar em mobile

1. Rodar `npm run dev`
2. Abrir `http://localhost:3000/jogo` no navegador em viewport mobile
3. Testar:
   - botão `←`
   - botão `→`
   - botão `Pular`
4. Validar que os controles ficam acessíveis no rodapé do jogo
5. Validar que o card e o canvas não ultrapassam a largura da tela
6. Validar share e CTAs finais

## QA rápido executado

Foi feita checagem local com:

- `npm run verify`
- screenshot desktop da rota `/jogo`
- screenshot mobile da rota `/jogo` para revisar largura e fallback de loading

Observação de QA:

- o fluxo mobile em captura headless mostrou primeiro o estado de loading do lazy-load, então a validação visual mais confiável ficou no desktop e no ajuste responsivo por código
