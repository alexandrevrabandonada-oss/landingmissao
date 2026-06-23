# Estado da Nacao - Integracao Campanhas de Base

Data: 2026-05-04
Projeto analisado: Landing Missao
Escopo: integracao estrategica entre vitrine publica e App Missao ELuta

## 1) Confirmacao de contexto
DIAG executado antes de alterar codigo.

Resultado:
- Ambiente atual: Landing Missao
- Nao estamos no repositorio do App Missao ELuta

Evidencias de rotas locais:
- /
- /lancamento
- /metodo
- /formacao/campanhas-de-base

Implicacao tecnica:
- Nesta codebase, foram feitas apenas alteracoes de vitrine e linkagem externa.
- Nenhum backend foi criado.
- Nenhuma area interna falsa com auth foi criada.

## 2) O que foi alterado na Landing

### 2.1 Configuracao central de links para o app
Arquivo criado:
- content/siteLinks.ts

Campos adicionados:
- appBaseUrl
- appSignupUrl
- appFormacaoUrl
- appMissoesUrl
- appDebatesUrl
- appConviteUrl

Comportamento:
- appBaseUrl vem de NEXT_PUBLIC_ELUTA_APP_URL quando existir.
- fallback padrao: https://app.missaoeluta.org

### 2.2 CTAs do modulo conectados ao app principal
Arquivo alterado:
- src/content/campanhasDeBase.ts

Mudancas:
- substituicao de paths locais/genericos por URLs externas configuraveis
- ajuste de nomenclatura para CTA de formacao

CTAs finais no modulo:
- Entrar no app -> appSignupUrl
- Ver formacao no app -> appFormacaoUrl
- Participar de debate -> appDebatesUrl
- Chamar mais pessoas -> appConviteUrl

### 2.3 /metodo explicitamente publico
Arquivo alterado:
- app/metodo/page.tsx

Mudanca:
- aviso visivel no topo informando que a pagina e publica de apresentacao
- reforco de que formacao aplicada, missoes e debates acontecem no app

### 2.4 UX de saida segura para o app
Arquivo alterado:
- src/components/campanhas/CampanhasDeBaseModule.tsx

Mudancas:
- links de CTA com target="_blank"
- rel="noopener noreferrer"

## 3) O que ficou na Landing
- Conteudo editorial publico do laboratorio
- Comparativos e matriz didatica
- Paginas de vitrine:
  - /metodo
  - /formacao/campanhas-de-base
- Encaminhamento por links para o app principal

## 4) O que foi para o App (nesta etapa)
Como o repositorio atual e a Landing, nenhuma integracao interna no App foi implementada aqui.

Ficou preparado para o App Missao ELuta consumir/receber:
- fluxo de entrada (signup)
- rota de formacao
- rota de debates
- rota de convite

## 5) Plano tecnico seguro para o App Missao ELuta (proxima fase)
1. Criar trilha em /formacao:
   - "Campanhas de Base e Organizacao Popular"
2. Estruturar 8 aulas baseadas nas referencias da landing:
   - com resumo, acertos, risco/limite, adaptacao, missao pratica, cuidado juridico
3. Criar missoes praticas de 10 a 15 minutos:
   - escutar 3 pessoas
   - registrar 1 demanda do bairro
   - convidar 2 pessoas para conhecer o app
   - mapear um problema publico
   - participar de um debate
4. Manter guardrails juridicos de pre-campanha:
   - sem pedido explicito de voto
   - sem numero eleitoral
   - sem "eleja"
   - sem promessa individual
5. Instrumentar origem:
   - parametro de origem da landing nos links
   - leitura em /admin/origens para mensurar funil landing -> app

## 6) Validacao tecnica
Comando executado:
- npm run verify

Resultado:
- typecheck: OK
- lint: OK
- build: OK

## 7) Resumo executivo
- Projeto atual confirmado: Landing Missao.
- Integracao aplicada com seguranca: vitrine publica + links externos configuraveis para o app.
- Nenhuma simulacao de area interna foi criada na landing.
- Proxima etapa para integracao profunda deve ocorrer no repositorio do App Missao ELuta.

## 8) Atualizacao 2026-06-23 - Hub externo de jogos

### 8.1 Decisao de arquitetura
- Os mini-jogos deixaram de ser promovidos como experiencia principal dentro da Landing Missao.
- A vitrine publica agora aponta para um hub externo dedicado:
  - `https://abandonadagames.online`
- A Landing Missao permanece com papel de:
  - identidade publica
  - apresentacao do metodo
  - encaminhamento para o App Missao ELuta

Racional:
- reduz acoplamento visual entre landing e runtime de jogos
- evita peso desnecessario nas paginas publicas
- separa melhor vitrine, jogos e organizacao

### 8.2 Centralizacao de links
Arquivo alterado:
- `src/content/siteLinks.ts`

Novidades:
- `gamesBaseUrl`
- `buildGamesHubUrl(ref?)`

Comportamento:
- fallback padrao: `https://abandonadagames.online`
- configuravel por `NEXT_PUBLIC_ABANDONADA_GAMES_URL`
- preserva `ref` quando existir
- aplica tracking:
  - `utm_source=landing`
  - `utm_medium=external_hub`
  - `utm_campaign=pre_campanha_alexandre_vr_abandonada`

### 8.3 Componente compartilhado de integracao
Arquivo criado:
- `src/components/public/ExternalGamesHubCallout.tsx`

Objetivo:
- evitar blocos duplicados em paginas publicas
- padronizar copy, CTA e tracking
- permitir variacoes de contexto sem repetir markup

Variantes implementadas:
- `lancamento`
- `metodo`
- `formacao`

### 8.4 Paginas atualizadas
Arquivos alterados:
- `app/lancamento/page.tsx`
- `app/metodo/page.tsx`
- `app/formacao/campanhas-de-base/page.tsx`

Resultado por rota:
- `/lancamento`
  - remove os cards internos dos jogos
  - substitui por callout para o Abandonada Games
  - mantem CTA de volta para o app
- `/metodo`
  - adiciona callout de jogos autorais sem mexer no modulo principal
- `/formacao/campanhas-de-base`
  - adiciona callout equivalente para quem chega pela trilha de formacao

### 8.5 CSS e manutencao
Arquivo limpo:
- `app/lancamento/page.tsx`

Mudanca:
- remocao do CSS especifico dos antigos cards de jogo
- consolidacao da integracao no componente compartilhado

Impacto:
- menos superficie para regressao visual
- manutencao mais simples

### 8.6 Validacao tecnica
Comando executado:
- `npm run verify`

Resultado:
- typecheck: OK
- lint: OK
- build: OK

### 8.7 Estado atual
- Landing Missao nao embute mais os jogos como destaque principal
- O fluxo publico agora ficou:
  - landing/metodo/formacao -> Abandonada Games -> App Missao ELuta
- Tracking e `ref` ficaram centralizados
- A integracao publica ficou consistente entre as tres rotas
