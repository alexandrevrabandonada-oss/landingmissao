# Estado da Nação: Jogo Assets v1

Data: 2026-05-14

## Objetivo desta etapa

Melhorar a apresentação visual do mini-jogo sem alterar a mecânica principal de:

- correr
- pular
- coletar
- desviar de obstáculos

## Resultado entregue

O protótipo v0 foi elevado para uma versão visual v1 com:

- personagem autoral estilizado em 3 estados
- cenário em camadas com parallax
- obstáculos e coletáveis redesenhados
- easter eggs visuais com contador
- tela inicial mais forte
- tela final com card compartilhável visual
- botão `Ver easter eggs encontrados`

## Direção aplicada

- preto, amarelo, ferrugem e concreto
- stencil e grafite
- clima urbano-industrial de Volta Redonda
- personagem inspirado nas fotos enviadas, mas desenhado de forma autoral e não realista

### Base visual do personagem

O avatar foi redesenhado tomando como referência:

- cabelo escuro e volumoso
- barba marcada
- silhueta magra
- camiseta escura com acento amarelo
- leitura pública coerente com Alexandre VR Abandonada

Não foi usada foto realista dentro do jogo.

## Arquivos criados

- `public/game/player-idle.svg`
- `public/game/player-run.svg`
- `public/game/player-jump.svg`
- `public/game/layer-sky.svg`
- `public/game/layer-serras.svg`
- `public/game/layer-rio.svg`
- `public/game/layer-industrial.svg`
- `public/game/layer-concreto.svg`
- `reports/estado-da-nacao-jogo-assets-v1.md`

## Arquivos editados

- `src/features/game/GameExperience.tsx`
- `public/game/collect-relato.svg`
- `public/game/collect-prova.svg`
- `public/game/collect-memoria.svg`
- `public/game/collect-apoio.svg`
- `public/game/obstacle-processinho.svg`
- `public/game/obstacle-carimbo.svg`
- `public/game/obstacle-muralha.svg`

## Arquivos removidos

- `public/game/player.svg`

## Melhorias visuais implementadas

### 1. Player sprite em 3 estados

Entraram três sprites distintos:

- `player-idle.svg`
- `player-run.svg`
- `player-jump.svg`

Uso no runtime:

- parado quando a velocidade horizontal é baixa
- correndo quando há deslocamento relevante no chão
- pulando quando o personagem está no ar

### 2. Fundo em camadas com parallax

O cenário foi quebrado em camadas independentes:

- céu ferrugem
- serras
- rio
- silhueta industrial
- concreto urbano

O runtime agora desenha essas camadas com velocidades diferentes para criar profundidade sem engine externa.

### 3. Obstáculos redesenhados

Obstáculos visuais melhorados:

- `Processinho Voador`
- `Carimbo da Burocracia`
- `Muralha do Silêncio`

Foram mantidos os mesmos papéis funcionais de gameplay.

### 4. Coletáveis redesenhados

Coletáveis visuais melhorados:

- `Relato`
- `Prova`
- `Memória`
- `Apoio Popular`

Também foi adicionado brilho leve em canvas para destacá-los sem pesar o jogo.

### 5. Easter eggs

Entraram seis easter eggs com linguagem de stencil:

- `Bacião Skate Vive`
- `VR Não Esquece`
- `Recibo é lei`
- `Capivara ECO escondida`
- `Pó preto não é paisagem`
- `Arquivo Vivo`

Comportamento:

- aparecem como marcas urbanas no cenário
- são descobertos ao avançar na corrida
- possuem contador no HUD
- podem ser revisados em painel próprio

## Melhorias de UI

### Tela inicial

O jogo agora abre com uma tela inicial mais forte, com:

- chamada principal
- contexto visual
- texto de missão
- CTA `Começar missão`

### Tela final

A tela final agora inclui:

- resumo textual do resultado
- card visual compartilhável
- estatísticas principais
- contador de easter eggs
- CTA de compartilhar
- CTA de entrada no app
- CTA de primeira missão

### Painel de easter eggs

Foi adicionado:

- botão `Ver easter eggs encontrados`
- painel listando quais foram encontrados

## Mecânica preservada

A mecânica principal foi mantida:

- sem engine nova
- sem física nova
- sem mudança de regra de vitória
- sem mudança do loop central

O trabalho ficou concentrado em:

- assets
- desenho de cena
- apresentação
- estados de interface

## Performance

O jogo continua leve porque:

- tudo segue em Canvas 2D puro
- os assets continuam em SVG
- o runtime segue lazy-loaded
- o jogo segue isolado na rota `/jogo`
- a landing não carrega o bundle do jogo

## Riscos evitados

### Propriedade intelectual

Evitado:

- sprites ou blocos reconhecíveis de Mario/Nintendo
- logos de empresas reais
- estética derivativa de franquia protegida

### Pré-campanha

Evitado:

- pedido de voto
- número eleitoral
- `eleja`
- inimigo personificado como pessoa real
- violência

## Resultado do verify

Comando executado:

- `npm run verify`

Status:

- `typecheck`: ok
- `lint`: ok
- `build`: ok

## Observação de QA

Foi feita uma checagem automática local após o build.

Limitação observada:

- em captura headless, a imagem registrada mostrou majoritariamente o estado inicial e o estado de carregamento client-side, o que é compatível com o lazy-load adotado

Conclusão:

- a verificação técnica está fechada
- a QA visual dinâmica ainda se beneficia de uma rodada manual interativa no navegador
