# Estado da Nação: Jogo Viral v1

Data: 2026-05-14

## Objetivo desta etapa

Adicionar uma camada de viralização ética ao mini-jogo, sem:

- ranking público nominal
- coleta de dados pessoais
- login obrigatório
- registro de intenção política
- analytics novo

## Resultado entregue

O fluxo final do jogo agora inclui:

- 3 métricas públicas de resultado
- 4 títulos de resultado não tóxicos
- card visual final mais compartilhável
- Web Share API com fallback progressivo
- botões por rede social
- CTA final para app e missão
- rastreio oportunista apenas se algum analytics já existir no `window`

## Arquivos editados

- `src/features/game/GameExperience.tsx`
- `src/lib/shareLaunch.ts`

## Arquivos criados

- `src/lib/trackEvent.ts`
- `reports/estado-da-nacao-jogo-viral-v1.md`

## Métricas finais implementadas

O resultado final agora mostra:

- `relatos coletados`
- `obstáculos desviados`
- `easter eggs encontrados`

Observação:

- `obstáculos desviados` é contado quando o obstáculo sai da área jogável sem colidir com o personagem

## Títulos de resultado implementados

Entraram os quatro títulos pedidos:

- `Escutador do Território`
- `Guardião da Memória`
- `Contra a Burocracia`
- `Cidade em Movimento`

Lógica:

- memória alta prioriza `Guardião da Memória`
- muitos obstáculos desviados priorizam `Contra a Burocracia`
- volume alto de relatos prioriza `Escutador do Território`
- restante cai em `Cidade em Movimento`

Não existe ranking entre pessoas, nem comparação pública.

## Card visual final

O card final foi ajustado para conter:

- `Eu joguei a Missão Relâmpago`
- `Pré-campanha Alexandre VR Abandonada`
- `Missão ÉLuta — Escutar • Cuidar • Organizar`
- resultado com métricas
- link rastreável do jogo

## Compartilhamento

### Web Share API

Fluxo principal:

- tenta `navigator.share`
- se falhar, copia a mensagem completa
- se a cópia da mensagem falhar, tenta copiar o link
- se ainda assim falhar, abre o WhatsApp com texto pronto

### Redes sociais adicionadas

Botões adicionados:

- `WhatsApp`
- `Facebook`
- `Instagram`
- `TikTok`

### Comportamento por rede

WhatsApp:

- abre com mensagem pronta

Facebook:

- abre o compartilhamento do link

Instagram:

- copia texto/link para colar
- abre o destino da plataforma

TikTok:

- copia texto/link para colar
- abre o destino da plataforma

Observação importante:

- Instagram e TikTok não oferecem um fluxo web universal e ético de composer pré-preenchido equivalente ao WhatsApp/Facebook
- por isso o fallback correto aqui é `copiar + abrir destino`, sem scraping, sem automação invasiva e sem coleta extra

## CTA final

O jogo agora fecha com:

- `Entrar no app`
- `Receber primeira missão`
- `Compartilhar com 3 pessoas`

Também mantém:

- `Compartilhar resultado`
- `Ver easter eggs encontrados`
- `Jogar de novo`

## Analytics

### Estado encontrado

O repositório não possui analytics instalado localmente.

### O que foi feito

Foi criado apenas um adaptador leve:

- usa `gtag`, `plausible` ou `dataLayer` somente se já existirem no `window`
- não instala SDK
- não cria provedor novo

Eventos suportados:

- `game_start`
- `game_finish`
- `game_share_click`
- `game_app_cta_click`

### Limite ético mantido

Nenhum dado pessoal é coletado pelo jogo.

Nenhum evento sensível novo é enviado sem existir antes um provedor externo já presente no ambiente.

## Regras éticas preservadas

Preservado:

- sem ranking nominal
- sem login obrigatório
- sem pedido de voto
- sem número eleitoral
- sem intenção política registrada
- `ref/UTM` apenas nos links

## Resultado do verify

Comando executado:

- `npm run verify`

Status:

- `typecheck`: ok
- `lint`: ok
- `build`: ok

## Resumo técnico

- a viralização ficou centrada em share local e links
- não há backend novo
- não há leaderboard
- não há coleta excessiva
- a experiência final está mais social sem virar mecanismo de competição tóxica
