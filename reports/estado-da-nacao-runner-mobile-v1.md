# Estado da Nação — Runner Mobile v1

## Resultado

O `/jogo/rua` foi polido para beta mobile com foco em:

- swipe mais estável
- começo menos punitivo
- tutorial mais claro
- tela final mais legível no celular
- asset dedicado para `Ninguém escuta`
- destaque melhor do runner na landing

## Arquivos editados

- `src/features/game-rua/GameRuaExperience.tsx`
- `app/lancamento/page.tsx`

## Arquivos criados

- `public/game-runner/obstacle-ninguem-escuta.svg`
- `reports/checklist-qa-runner-mobile.md`
- `reports/estado-da-nacao-runner-mobile-v1.md`

## Ajustes de swipe

- `threshold` do gesto aumentado
- validação de duração mínima e máxima do gesto
- exigência de direção dominante antes de disparar comando
- prevenção de comando duplicado no mesmo gesto
- toque curto deixa de virar swipe acidental
- `touch-action: none` mantido só na área jogável, não no shell inteiro
- scroll continua bloqueado dentro da área do jogo, sem capturar a página toda

## Ajustes de dificuldade

- velocidade inicial reduzida
- curva de aproximação suavizada
- começo protegido com janela de segurança por tempo e distância
- intervalo de obstáculos ampliado
- spawn inicial evita combos pular + abaixar muito cedo
- coletáveis aparecem com mais respiro
- power-ups aparecem com frequência mais útil
- janela efetiva de pulo e abaixar levemente ampliada para colisão mais justa
- placeholder de placa substituído por asset real

## Asset criado

- `public/game-runner/obstacle-ninguem-escuta.svg`

Uso:

- substitui o fallback visual que antes reaproveitava o grupo do processo

## Melhorias de tutorial

- texto curto novo:
  - `Uma missão relâmpago. Um minuto. Uma cidade em movimento.`
- tutorial inicial trocado para 4 cards:
  - deslize para os lados
  - deslize para cima para pular
  - deslize para baixo para abaixar
  - colete relatos e apoio popular

## Melhorias da tela final

- card final com leitura mais próxima de story
- estatísticas finais reorganizadas em cards
- título conquistado destacado
- hierarquia mais clara para:
  - relatos coletados
  - obstáculos desviados
  - easter eggs encontrados
- CTAs mantidos com prioridade correta:
  - `Compartilhar resultado`
  - `Entrar no app`
  - `Receber primeira missão`
- botões continuam grandes no mobile

## Alterações na landing

No bloco `Escolha sua missão relâmpago`:

- runner recebeu badge `Melhor no celular`
- runner agora usa o texto:
  - `Modo Rua — rápido, vertical e feito para jogar com uma mão.`
- plataforma agora usa o texto:
  - `Modo Retrô — plataforma 2D autoral.`

Nenhum runtime de jogo foi carregado na landing.

## Testes executados

### Build e qualidade

- `npm run verify`

Resultado:

- `typecheck` OK
- `lint` OK
- `build` OK

### Smoke HTTP

- `/jogo` -> `200`
- `/jogo/rua` -> `200`
- `/jogo/rua?ref=TESTE123` -> `200`
- `/lancamento` -> `200`

### Smoke visual local

Capturas geradas em `reports/qa/`:

- `runner-mobile-v1-390.png`
- `lancamento-runner-v1.png`

### O que foi verificado de fato

- o runner abre em `390x844`
- o tutorial novo renderiza
- a landing continua intacta
- a build final preserva `/jogo` e `/jogo/rua`

## Pendências reais

- não houve teste físico real em iPhone/Safari
- não houve teste físico real em Android/Chrome
- não houve validação manual do share sheet nativo em aparelho físico
- a calibração de swipe foi melhorada por lógica e smoke local, mas ainda precisa de dedo real em tela real
- a taxa real de conclusão ainda precisa de 3 a 5 playtests externos rápidos

## Recomendação

`ainda não`

Motivo:

o código está mais estável e mais próximo do beta, mas ainda falta a parte que mais importa para um runner mobile-first: validação física de swipe, ergonomia dos botões e sensação de pulo/abaixar em aparelho real.
