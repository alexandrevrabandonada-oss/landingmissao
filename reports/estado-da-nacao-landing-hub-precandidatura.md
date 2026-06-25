# Estado da Nação — Landing Hub de Pré-candidatura

Data: 2026-06-25

## Objetivo

Reorganizar `/lancamento` para deixar de ser apenas uma página de evento e passar a funcionar como hub público da pré-candidatura Alexandre VR Abandonada.

## Direção adotada

A página agora concentra ações de diferentes níveis de engajamento:

- Grupo de voluntários da pré-campanha.
- App Missão ÉLuta.
- Vaquinha online.
- Ferramenta de foto de apoio.
- Abandonada Games.
- Compartilhamento público.
- Lançamento presencial.

## Referências pesquisadas

Critérios usados a partir da pesquisa:

- Página de campanha deve funcionar como hub central de organização, contribuição e comunicação.
- CTAs precisam ser visíveis, diretos e segmentados por nível de compromisso.
- Experiência mobile precisa priorizar ação rápida.
- Ferramentas de compartilhamento e identidade visual aumentam circulação pública.
- Páginas de contribuição devem reduzir fricção e estar ligadas ao fluxo principal.

Referências consultadas:

- Solidarity Tech — political campaign websites: https://www.solidarity.tech/political-campaign-websites
- Solidarity Tech — website and landing page builder for organizers: https://www.solidarity.tech/website
- Impactive — 6 key elements to include on your campaign website: https://www.impactive.io/blog/6-key-elements-to-include-on-your-campaign-website
- Impactive — volunteer recruitment messages: https://www.impactive.io/blog/4-tips-for-creating-effective-volunteer-recruitment-messages
- GiveForms — nonprofit landing page design best practices: https://www.giveforms.com/blog/nonprofit-landing-page-design-best-practices-and-tips-2022
- GiveForms — best practices for a nonprofit website: https://www.giveforms.com/blog/best-practices-for-a-nonprofit-website

## Arquivos alterados

- `app/lancamento/page.tsx`
- `app/lancamento/ShareButtons.tsx`
- `src/components/launch/LaunchActionStrip.tsx`
- `src/content/siteLinks.ts`
- `app/apoio/page.tsx`
- `src/components/support/SupportPhotoTool.tsx`
- `content/launchEvent.ts`
- `public/og-lancamento.svg`

## Integrações

- Voluntariado: `https://chat.whatsapp.com/Bg2hJf84ih47kXgPcMVOGW`
- App: `https://missaoeluta.online/auth`
- Vaquinha: `https://queroapoiar.com.br/alexandrefonseca`
- Foto de apoio: `/apoio`
- Jogos: `https://abandonada-games.online`

## Mudanças principais em `/lancamento`

- Metadata atualizada para pré-candidatura, não apenas lançamento.
- Hero reescrito para posicionar Alexandre VR Abandonada como pré-candidato a deputado estadual.
- Navegação superior adicionada com âncoras de ação.
- Nova central de mobilização com seis cards de ação.
- Nova seção manifesto/método com três pilares: Escutar, Cuidar, Organizar.
- Blocos existentes reposicionados semanticamente: evento, app, fluxo de voluntariado, ferramentas virais.
- CTAs principais atualizados para grupo de voluntários, app, missão, foto de apoio, vaquinha e compartilhamento.

## Cuidados eleitorais

- Mantida linguagem de pré-campanha.
- Sem pedido explícito de voto.
- Sem número eleitoral.
- Sem uso de “eleja”.
- Sem promessa de benefício individual.
- Sem ataque a pessoa real.

## Verificação

`npm run verify` executado com sucesso:

- Typecheck OK.
- Lint OK.
- Build OK.

## QA visual e interativo

Teste executado em `http://127.0.0.1:3030/lancamento?ref=TESTE123`.

- Desktop `1280x720`: página carregou com título correto, sem overlay de erro e sem overflow horizontal.
- Mobile `390x844`: encontrado overflow horizontal inicial de `18px`.
- Correção aplicada: barra superior mobile agora permite encolhimento de marca/CTA; chips do hero quebram linha corretamente; footer não força largura maior que a viewport; elementos decorativos do card viral ficam clipados por seção.
- Mobile após correção: overflow horizontal `0px`.
- Interação testada: card `Criar foto de perfil` navega corretamente para `/apoio?ref=TESTE123`.
- Observação: havia erro antigo no console do navegador vindo de runtime dev stale do Next. O servidor local foi reiniciado e o build de produção continuou OK.

## Pendências reais

- Definir se a página `/lancamento` continuará com esse path ou se haverá alias público mais amplo, como `/` ou `/precandidatura`.
- Revisar copy fina com a coordenação política antes de impulsionamento público.
