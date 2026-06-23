# Estado da Nação — Runner Mobile v0

## Resultado

Implementado o v0 de `Missão ÉLuta: Rua em Movimento` em rota separada, sem quebrar `/jogo`, sem dependência nova e com Canvas 2D puro.

## Arquivos criados

- `app/jogo/rua/page.tsx`
- `app/jogo/rua/GameRuaEntry.tsx`
- `src/features/game-rua/GameRuaExperience.tsx`
- `public/game-runner/player-runner.svg`
- `public/game-runner/lane-road.svg`
- `public/game-runner/bg-vr-rua.svg`
- `public/game-runner/obstacle-processinho.svg`
- `public/game-runner/obstacle-carimbo.svg`
- `public/game-runner/obstacle-buraco.svg`
- `public/game-runner/obstacle-muralha.svg`
- `public/game-runner/collect-relato.svg`
- `public/game-runner/collect-prova.svg`
- `public/game-runner/collect-memoria.svg`
- `public/game-runner/collect-apoio.svg`
- `public/game-runner/power-megafone.svg`
- `public/game-runner/power-arquivo.svg`
- `public/game-runner/power-respira.svg`
- `public/game-runner/lancamento-preview.svg`

## Arquivos editados

- `app/lancamento/page.tsx`
- `src/lib/shareLaunch.ts`

## Rota criada

- `/jogo/rua`

## Estrutura implementada

- Rota server em `app/jogo/rua/page.tsx`
- Lazy-load client-only em `app/jogo/rua/GameRuaEntry.tsx`
- Runtime isolado do runner em `src/features/game-rua/GameRuaExperience.tsx`
- Assets dedicados em `public/game-runner/`

## Controles implementados

### Mobile

- swipe esquerda: muda para faixa esquerda
- swipe direita: muda para faixa direita
- swipe para cima: pular
- swipe para baixo: abaixar
- botões de acessibilidade:
  - `←`
  - `→`
  - `Pular`
  - `Abaixar`

### Desktop

- `ArrowLeft` e `A`: faixa esquerda
- `ArrowRight` e `D`: faixa direita
- `ArrowUp` ou `Espaço`: pular
- `ArrowDown`: abaixar

## Gameplay v0

- runner automático em 3 faixas
- canvas em retrato com leitura mobile-first
- sessão curta com alvo em torno de 45 a 75 segundos
- início mais leve
- coletáveis:
  - `Relato`
  - `Prova`
  - `Memória`
  - `Apoio Popular`
- obstáculos:
  - `Processinho Voador`
  - `Carimbo da Burocracia`
  - `Buraco do Abandono`
  - `Muralha do Silêncio`
  - `Placa "Ninguém escuta"` representada no runtime usando o mesmo grupo visual do processo
- power-ups:
  - `Megafone Popular`
  - `Arquivo Vivo`
  - `Respira Fundo`
- easter eggs:
  - `Bacião Skate Vive`
  - `VR Não Esquece`
  - `Recibo é lei`
  - `Capivara ECO`
  - `Pó preto não é paisagem`
  - `Arquivo Vivo`
  - `Escutar • Cuidar • Organizar`

## Integração na landing

O bloco de teaser foi ampliado em `/lancamento` para:

- `Escolha sua missão relâmpago`
- card `Corre da Burocracia`
- card `Rua em Movimento`
- CTA runner: `Jogar no celular`
- CTA secundário: `Depois entrar no app`

Nenhum runtime de jogo é carregado na landing.

## Share e tracking

- URL de share do runner preserva `ref`
- adiciona:
  - `utm_source=game`
  - `utm_medium=share`
  - `utm_campaign=pre_campanha_alexandre_vr_abandonada`
  - `utm_content=runner_rua`
- mensagem própria do runner em `src/lib/shareLaunch.ts`
- Web Share API com fallback para:
  - WhatsApp
  - Facebook
  - Instagram via copiar + abrir
  - TikTok via copiar + abrir
  - copiar mensagem
  - copiar link

## Reduced motion

- `prefers-reduced-motion` mostra fallback estático
- fallback mantém:
  - `Compartilhar resultado`
  - `Entrar no app`
  - `Receber primeira missão`

## Como testar

### Rotas

- abrir `/jogo`
- abrir `/jogo/rua`
- abrir `/jogo/rua?ref=TESTE123`
- abrir `/lancamento`

### Runner

1. iniciar a missão
2. trocar de faixa
3. pular um `Carimbo` ou `Buraco`
4. abaixar de `Processinho`
5. pegar pelo menos um power-up
6. chegar ao fim ou perder
7. testar `Compartilhar resultado`
8. testar `WhatsApp`, `Facebook`, `Instagram`, `TikTok`
9. testar `Entrar no app`
10. testar `Receber primeira missão`

### Viewports

- mobile: `390x844`
- desktop: `1366x768`

## Verificação executada

- `npm run verify`
- smoke HTTP:
  - `/jogo` -> `200`
  - `/jogo/rua` -> `200`
  - `/jogo/rua?ref=TESTE123` -> `200`
- verificação de serialização do `shareUrl` na rota runner:
  - `ref=TESTE123`
  - `utm_source=game`
  - `utm_medium=share`
  - `utm_campaign=pre_campanha_alexandre_vr_abandonada`
  - `utm_content=runner_rua`
- screenshots headless locais salvos em `reports/qa/`

## Riscos evitados

- sem dependência nova
- sem backend
- sem ranking
- sem login obrigatório
- sem coleta de dado pessoal
- sem denúncia real no jogo
- sem pedido de voto
- sem número eleitoral
- sem copiar assets ou identidade visual reconhecível de franquias de runner
- `/jogo` existente mantido em rota separada

## Pendências reais

- a `Placa "Ninguém escuta"` ainda não tem asset dedicado; no v0 ela reaproveita a família visual do processo
- falta playtest manual em aparelho físico iPhone/iOS Safari
- falta playtest manual em Android físico para calibrar sensação do swipe e da janela do pulo
- a dificuldade ainda precisa de uma passada de beta com jogadores casuais para medir taxa real de conclusão
