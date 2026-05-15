# Estado da Nação — Landing Identidade v7

**Projeto:** Landing Missao  
**Escopo:** padronização de identidade pública e integração com o App Missão ÉLuta  
**Data:** 2026-05-14

## Arquivos alterados

- `src/content/siteIdentity.ts`
- `src/content/siteLinks.ts`
- `content/launchEvent.ts`
- `src/lib/shareLaunch.ts`
- `app/layout.tsx`
- `app/lancamento/page.tsx`
- `app/lancamento/ShareButtons.tsx`
- `app/lancamento/ViralBlock.tsx`
- `src/components/launch/LaunchActionStrip.tsx`
- `src/components/launch/LaunchShareCard.tsx`
- `src/content/campanhasDeBase.ts`
- `src/components/campanhas/CampanhasDeBaseModule.tsx`
- `app/metodo/page.tsx`
- `app/formacao/campanhas-de-base/page.tsx`
- `scripts/audit-landing-identity.mjs`
- `package.json`

## Identidade central criada

- Nome público: `Alexandre VR Abandonada`
- Contexto: `Pré-campanha`
- App/projeto: `Missão ÉLuta`
- Assinatura: `Escutar • Cuidar • Organizar`
- Frase-mãe: `A organização popular agora cabe no bolso.`

## CTAs revisados

### `/lancamento`

- CTA principal: `Participar da pré-campanha`
- CTA app: `Entrar no app Missão ÉLuta`
- CTA missão: `Receber minha primeira missão`
- CTA viral: `Chamar mais 3 pessoas`

### `/metodo`

- CTA principal: `Entrar no app e conhecer o método`
- CTA secundário: `Ver formação no app`
- CTA viral: `Compartilhar o método`

### `/formacao/campanhas-de-base`

- CTA principal: `Começar a formação no app`
- CTA secundário: `Ver missões de escuta`
- CTA viral: `Chamar alguém para estudar junto`

## Links para o app

- `appBaseUrl`
- `appSignupUrl`
- `appFormacaoUrl`
- `appMissoesUrl`
- `appDebatesUrl`
- `appConviteUrl`

Os builders agora preservam `ref` quando existe e adicionam:

- `utm_source=landing`
- `utm_medium=cta`
- `utm_campaign=pre_campanha_alexandre_vr_abandonada`

## WhatsApp

- Mensagem padronizada atualizada para:
  - `Conheça a pré-campanha Alexandre VR Abandonada e o app Missão ÉLuta.`
  - `A ideia é transformar escuta em organização popular.`
  - `Escutar • Cuidar • Organizar.`
  - `Vem conhecer: [LINK]`
- O link compartilhado preserva `ref` e usa:
  - `utm_source=landing`
  - `utm_medium=share`
  - `utm_campaign=pre_campanha_alexandre_vr_abandonada`

## Card `EU VOU`

- Contém `Pré-campanha Alexandre VR Abandonada`
- Contém `App Missão ÉLuta`
- Contém `Escutar • Cuidar • Organizar`
- Contém `Chame mais 3 pessoas`
- Sem número eleitoral
- Sem pedido de voto

## Novo bloco

- Seção adicionada em `/lancamento`: `Depois que você entra no app`
- Passos:
  1. Você cria seu cadastro
  2. A coordenação aprova
  3. Você recebe uma missão simples
  4. Você registra sua ação
  5. Você compartilha e chama mais gente
- Texto de apoio:
  - `A landing chama. O app organiza. A missão transforma escuta em ação.`

## OG e footer

- `title`, `description`, Open Graph e Twitter ajustados para a identidade central.
- Footer revisado para exibir `Pré-campanha Alexandre VR Abandonada` e `Missão ÉLuta — Escutar • Cuidar • Organizar`.

## Preservação de `ref` / UTM

- `/lancamento` preserva `ref` ao construir links de share.
- CTAs para o app agora saem com tracking padronizado.
- O compartilhamento via WhatsApp usa o link com `ref` e UTMs específicos de share.

## Riscos eleitorais evitados

- Sem pedido explícito de voto
- Sem número eleitoral
- Sem uso de `eleja`
- Sem linguagem de propaganda oficial de campanha
- Sem backend novo
- Sem mexer em Supabase

## Auditoria simples

- Script adicionado: `scripts/audit-landing-identity.mjs`
- Script registrado em `package.json` como `audit:identity`
- Resultado atual:
  - `WARNING src/content/campanhasDeBase.ts:78 - campanha sem pré-campanha: nome: "Zapatismo civil / Outra Campanha",`

## Verificação

- `npm run verify`
- Resultado: sucesso
- Comandos executados:
  - `typecheck`
  - `lint`
  - `build`

## Observação de QA visual

- Verificação no navegador local feita em desktop e mobile.
- O topo, os CTAs, o bloco `Depois que você entra no app`, o CTA strip e o bloco viral renderizaram sem overflow visível nos breakpoints checados.
