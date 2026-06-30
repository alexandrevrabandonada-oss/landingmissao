# Plano SEO v1 — Landing Missao / Alexandre VR Abandonada

Data: 2026-06-30

## Escopo

Análise técnica, editorial e estratégica de SEO para o site público da pré-campanha Alexandre VR Abandonada, incluindo:

- `/lancamento`
- `/apoio`
- `/metodo`
- `/formacao/campanhas-de-base`
- `/jogo`
- `/jogo/rua`
- raiz `/`
- arquivos de metadados, robots, sitemap, Open Graph e estrutura HTML renderizada

Não foram feitas alterações de implementação neste relatório.

## Fontes e ferramentas usadas

### Ferramentas locais

- Inspeção do código Next.js App Router.
- `npm run build`.
- `next start` local na porta `3040`.
- Auditoria de HTML renderizado via `Invoke-WebRequest`.
- Busca local com `rg`.
- Inspeção de arquivos públicos em `public/`.
- Inspeção de metadados por rota.
- Checagem de heading structure e JSON-LD renderizado.

### Referências oficiais consultadas

- Google Search Central — SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Search Central — Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Google Search Central — Structured Data: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Next.js App Router — `sitemap.xml`: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Next.js App Router — `robots.txt`: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

## Resumo executivo

O site tem boa base editorial, estrutura de headings consistente e conteúdo indexável relevante para buscas de marca, pré-campanha, organização popular e Volta Redonda. O principal problema SEO atual é técnico: canonicals e Open Graph estão sendo gerados com domínio antigo/fallback `https://missaoeluta.com.br`, enquanto o domínio público atual é `https://www.alexandrevrabandonada.online`.

Também faltam `robots.txt`, `sitemap.xml`, dados estruturados JSON-LD e uma estratégia clara de indexação para páginas utilitárias/jogos. O maior ganho rápido vem de corrigir domínio, sitemap/robots e metadados por página.

## Evidências coletadas

### Build

`npm run build` executado com sucesso.

Rotas geradas:

| Rota | Tipo | First Load JS |
|---|---:|---:|
| `/` | static redirect | 102 kB |
| `/apoio` | dynamic | 112 kB |
| `/formacao/campanhas-de-base` | dynamic | 102 kB |
| `/jogo` | dynamic | 104 kB |
| `/jogo/rua` | dynamic | 104 kB |
| `/lancamento` | dynamic | 111 kB |
| `/metodo` | dynamic | 102 kB |

### HTML renderizado

Auditoria local em `http://localhost:3040`:

| Rota | Status | Title | Canonical renderizado | OG image |
|---|---:|---|---|---|
| `/` | 307 | n/a | n/a | n/a |
| `/lancamento` | 200 | `Pré-candidatura Alexandre VR Abandonada · Missão ÉLuta` | `https://missaoeluta.com.br/lancamento` | `https://missaoeluta.com.br/og-lancamento.svg` |
| `/apoio` | 200 | `Foto de apoio | Pré-campanha Alexandre VR Abandonada` | `https://missaoeluta.com.br/apoio` | `https://missaoeluta.com.br/og-lancamento.svg` |
| `/metodo` | 200 | `Método | Pré-campanha Alexandre VR Abandonada · Missão ÉLuta` | `https://missaoeluta.com.br/metodo` | ausente |
| `/formacao/campanhas-de-base` | 200 | `Formação | Pré-campanha Alexandre VR Abandonada · Missão ÉLuta` | `https://missaoeluta.com.br/formacao/campanhas-de-base` | ausente |
| `/jogo` | 200 | `Jogo | Pré-campanha Alexandre VR Abandonada · Missão ÉLuta` | `https://missaoeluta.com.br/jogo` | `https://missaoeluta.com.br/og-lancamento.svg` |
| `/jogo/rua` | 200 | `Jogo Runner | Pré-campanha Alexandre VR Abandonada · Missão ÉLuta` | `https://missaoeluta.com.br/jogo/rua` | `https://missaoeluta.com.br/game-runner/lancamento-preview.svg` |
| `/robots.txt` | 404 | n/a | n/a | n/a |
| `/sitemap.xml` | 404 | n/a | n/a | n/a |

### Headings e dados estruturados

| Rota | H1 | H2 | JSON-LD |
|---|---:|---:|---:|
| `/lancamento` | 1 | 12 | 0 |
| `/apoio` | 1 | 0 | 0 |
| `/metodo` | 1 | 4 | 0 |
| `/formacao/campanhas-de-base` | 1 | 4 | 0 |
| `/jogo` | 1 | 1 | 0 |
| `/jogo/rua` | 1 | 1 | 0 |

## Achados principais

### P0 — Canonical e OG apontam para domínio errado

Arquivo raiz:

- `app/layout.tsx`

Problema:

```ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://missaoeluta.com.br";
```

Impacto:

- O site atual pode estar informando ao Google e redes sociais que a URL canônica é outro domínio.
- Isso dilui indexação, compartilhamento e autoridade.
- Pode confundir Search Console e previews sociais.

Plano:

- Definir domínio oficial em ambiente de produção:
  - `NEXT_PUBLIC_SITE_URL=https://www.alexandrevrabandonada.online`
- Trocar fallback local para o domínio atual ou centralizar em `src/content/siteLinks.ts`.
- Garantir canonical absoluto e OG absoluto para todas as páginas.

### P0 — Ausência de `robots.txt` e `sitemap.xml`

Status local:

- `/robots.txt`: 404
- `/sitemap.xml`: 404

Impacto:

- Crawlers ainda podem indexar, mas a descoberta e governança das URLs ficam piores.
- Não há sinal claro de páginas prioritárias, `lastModified`, frequência ou rotas que devem/não devem indexar.

Plano:

- Criar `app/robots.ts`.
- Criar `app/sitemap.ts`.
- Incluir:
  - `/lancamento`
  - `/apoio`
  - `/metodo`
  - `/formacao/campanhas-de-base`
  - decidir política de `/jogo` e `/jogo/rua`
- Excluir ou `noindex` páginas internas de debug/playtest se existirem via querystring.

### P0 — Página `/apoio` tem description antiga

Arquivo:

- `app/apoio/page.tsx`

Descrição atual:

```txt
Crie uma montagem de perfil com a mensagem Eu apoio Glauber Braga e Alexandre VR Abandonada.
```

Problema:

- O fluxo atual prioriza `Só Alexandre`.
- O texto não menciona `pré-candidato a deputado estadual`.
- Perde alinhamento com o conteúdo real e com busca de marca.

Plano:

- Atualizar para algo como:

```txt
Crie sua foto de apoio a Alexandre VR Abandonada, pré-candidato a deputado estadual. A imagem é gerada no seu navegador, sem cadastro.
```

### P1 — Metadados OG incompletos em `/metodo` e `/formacao`

Arquivos:

- `app/metodo/page.tsx`
- `app/formacao/campanhas-de-base/page.tsx`

Problema:

- Essas páginas herdam OG genérico do layout.
- Não há `og:image` específico.

Plano:

- Adicionar `openGraph` e `twitter` por página.
- Criar imagens OG específicas:
  - `/og-metodo.png` ou `.svg`
  - `/og-formacao-campanhas-de-base.png` ou `.svg`

### P1 — Falta JSON-LD

Nenhuma página renderiza `application/ld+json`.

Oportunidades:

- `WebSite` para o domínio.
- `Organization` ou `PoliticalOrganization` deve ser avaliado com cautela; melhor usar `Organization`/`Person` sem sinal de campanha oficial.
- `Person` para Alexandre VR Abandonada como figura pública da pré-campanha.
- `Event` para lançamento em 4 de julho de 2026 às 14h, com endereço.
- `FAQPage` para as dúvidas da landing.
- `BreadcrumbList` para `/metodo`, `/formacao/campanhas-de-base`, `/apoio`, `/jogo`.

Cuidados:

- Não usar pedido de voto.
- Não usar número eleitoral.
- Não usar linguagem de candidatura oficial.
- Usar `Pré-campanha` e `pré-candidato a deputado estadual` quando necessário.

### P1 — Estratégia de indexação das páginas de jogo está indefinida

Rotas locais:

- `/jogo`
- `/jogo/rua`

Contexto:

- A landing passou a integrar o hub externo `https://abandonadagames.online`.
- As rotas locais ainda existem e são indexáveis.

Decisão necessária:

1. Manter indexáveis como páginas históricas/experiências próprias.
2. Aplicar canonical para o hub externo se o hub for o destino oficial.
3. Redirecionar 301 para o hub externo.
4. `noindex, follow` se forem legadas e ainda úteis para usuários existentes.

Recomendação:

- Se a estratégia oficial é concentrar jogos em `abandonadagames.online`, usar 301 ou canonical externo planejado.
- Se as páginas ainda funcionam e geram compartilhamento, manter indexáveis mas linkar claramente para o hub oficial e sitemapar apenas o hub da landing.

### P1 — Imagem principal pesada

Arquivo:

- `public/alexandre-retrato.png`

Tamanho:

- Aproximadamente 3.2 MB.

Impacto:

- Pode afetar LCP em mobile, mesmo usando `next/image`.
- Prejudica SEO indiretamente por Core Web Vitals.

Plano:

- Gerar versão otimizada:
  - AVIF/WebP para o hero.
  - PNG/JPEG fallback se necessário.
- Usar dimensões corretas e `sizes`.
- Manter original apenas se necessário para edição.

### P1 — Open Graph em SVG pode ter compatibilidade irregular

Arquivos:

- `public/og-lancamento.svg`
- imagens OG dos jogos em SVG.

Impacto:

- Algumas plataformas sociais podem não renderizar SVG como preview com consistência.

Plano:

- Gerar OG raster 1200×630 em PNG/WebP:
  - `/og-lancamento.png`
  - `/og-apoio.png`
  - `/og-metodo.png`
  - `/og-formacao.png`
  - `/og-jogo-rua.png`

### P2 — Raiz `/` redireciona para `/lancamento`

Arquivo:

- `app/page.tsx`

Comportamento:

- `redirect("/lancamento")`, status 307 no teste local.

Opções:

- Manter redirect se `/lancamento` for página canônica.
- Trocar para landing real em `/` e manter `/lancamento` como alias.

Recomendação:

- Para SEO de marca, considerar `/` como página principal canônica da pré-candidatura.
- Alternativa: manter `/lancamento`, mas fazer redirect permanente 308/301 de `/` para `/lancamento`.

### P2 — Falta estratégia de conteúdo por intenção de busca

Intenções relevantes:

- Marca/pessoa:
  - `Alexandre VR Abandonada`
  - `Alexandre Fonseca`
  - `Alexandre VR Abandonada pré-candidato`
- Local:
  - `pré-candidato deputado estadual Volta Redonda`
  - `Volta Redonda organização popular`
  - `pré-campanha Volta Redonda`
- Ferramenta:
  - `foto de apoio Alexandre VR Abandonada`
  - `app Missão ÉLuta`
  - `Missão ÉLuta`
- Evento:
  - `lançamento pré-candidatura Alexandre VR Abandonada`
  - `evento Alexandre VR Abandonada 4 de julho`

Plano editorial:

- Criar seção “Quem é Alexandre VR Abandonada” na landing.
- Criar seção “Agenda e lançamento” com dados estruturados.
- Criar página curta `/agenda` se houver mais eventos.
- Criar página `/quem-e` se o objetivo for dominar busca de nome.
- Criar página `/apoio` mais focada em termos de “foto de apoio” e “perfil”.

## Plano de implementação

### Fase 1 — Fundamentos técnicos críticos

Prazo sugerido: 0,5 a 1 dia.

Arquivos:

- `app/layout.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- `app/apoio/page.tsx`

Tarefas:

1. Definir `NEXT_PUBLIC_SITE_URL=https://www.alexandrevrabandonada.online` em produção.
2. Atualizar fallback local do `siteUrl`.
3. Criar `app/robots.ts`.
4. Criar `app/sitemap.ts`.
5. Corrigir description de `/apoio`.
6. Garantir `twitter.card = summary_large_image` onde houver imagem grande.
7. Rodar:
   - `npm run verify`
   - smoke local de `/robots.txt` e `/sitemap.xml`

Critério de pronto:

- `/robots.txt` retorna 200.
- `/sitemap.xml` retorna 200.
- Canonical usa domínio correto.
- `/apoio` tem description coerente.

### Fase 2 — Dados estruturados e previews sociais

Prazo sugerido: 1 a 2 dias.

Arquivos prováveis:

- `src/components/seo/JsonLd.tsx`
- `src/content/seo.ts`
- `app/lancamento/page.tsx`
- `app/apoio/page.tsx`
- `app/metodo/page.tsx`
- `app/formacao/campanhas-de-base/page.tsx`
- `app/jogo/page.tsx`
- `app/jogo/rua/page.tsx`
- `public/og-*.png`

Tarefas:

1. Criar helper seguro para JSON-LD.
2. Adicionar `WebSite` no layout ou landing.
3. Adicionar `Person` para Alexandre VR Abandonada.
4. Adicionar `Event` em `/lancamento`.
5. Adicionar `FAQPage` com FAQs da landing.
6. Adicionar `BreadcrumbList` nas páginas internas.
7. Gerar OG raster 1200×630 para páginas prioritárias.
8. Atualizar `openGraph.images` e `twitter.images`.

Critério de pronto:

- JSON-LD renderizado em HTML.
- Rich Results Test não acusa erros críticos.
- Previews sociais usam imagens raster.

### Fase 3 — Conteúdo e arquitetura de busca

Prazo sugerido: 2 a 4 dias.

Tarefas:

1. Decidir se a home canônica será `/` ou `/lancamento`.
2. Criar ou reforçar bloco “Quem é Alexandre VR Abandonada”.
3. Criar bloco “Volta Redonda, escuta e organização popular”.
4. Criar seção de agenda com dados de evento.
5. Revisar `/metodo` para busca de “método de campanha de base” sem parecer propaganda oficial.
6. Revisar `/formacao/campanhas-de-base` para ser indexável ou `noindex` dependendo da intenção.
7. Decidir política para `/jogo` e `/jogo/rua`.

Critério de pronto:

- Cada página tem intenção de busca clara.
- Não há páginas órfãs indexáveis.
- Links internos formam uma jornada: landing → apoio → app/voluntários/vaquinha → método/formação.

### Fase 4 — Performance e Core Web Vitals

Prazo sugerido: 1 a 2 dias.

Tarefas:

1. Otimizar `public/alexandre-retrato.png`.
2. Auditar LCP mobile.
3. Validar fontes externas do Google Fonts e considerar self-host se necessário.
4. Rodar Lighthouse/PageSpeed em produção.
5. Verificar CLS em `/apoio` e `/lancamento`.
6. Verificar lazy loading dos jogos e se rotas de jogo não afetam landing.

Critério de pronto:

- LCP mobile aceitável.
- Sem layout shift relevante.
- Imagem hero otimizada.

### Fase 5 — Search Console e operação

Prazo sugerido: após deploy.

Tarefas:

1. Adicionar propriedade no Google Search Console.
2. Enviar sitemap.
3. Inspecionar URL:
   - `/`
   - `/lancamento`
   - `/apoio`
   - `/metodo`
4. Monitorar cobertura, indexação e consultas.
5. Criar rotina semanal de:
   - verificar 404
   - verificar canonical
   - atualizar evento quando passar
   - revisar titles/descriptions

## Arquitetura recomendada de URLs

### Opção A — `/lancamento` continua canônica

Prós:

- Menor mudança.
- Preserva histórico atual.

Contras:

- A home `/` não acumula autoridade diretamente.
- O nome “lancamento” fica datado depois do evento.

Recomendação se escolher A:

- Depois do evento, renomear conteúdo para página de pré-candidatura e transformar `/lancamento` em alias.

### Opção B — `/` vira home canônica da pré-candidatura

Prós:

- Melhor para busca de marca.
- URL mais forte e simples.
- Evita página principal com nome datado.

Contras:

- Exige migração de canonical e redirecionamentos.

Recomendação:

- Melhor opção para médio prazo.
- `/lancamento` pode permanecer como rota de evento/arquivo ou redirecionar.

## Metadados sugeridos por página

### `/`

Title:

```txt
Alexandre VR Abandonada | Pré-candidato a deputado estadual
```

Description:

```txt
Conheça a pré-campanha Alexandre VR Abandonada: organização popular, escuta territorial, App Missão ÉLuta, voluntariado, vaquinha e materiais de apoio.
```

### `/lancamento`

Title:

```txt
Lançamento da pré-campanha Alexandre VR Abandonada
```

Description:

```txt
Evento de lançamento da pré-campanha Alexandre VR Abandonada em Volta Redonda: sábado, 4 de julho de 2026, às 14h, no Conforto.
```

### `/apoio`

Title:

```txt
Foto de apoio | Alexandre VR Abandonada
```

Description:

```txt
Crie sua foto de apoio a Alexandre VR Abandonada, pré-candidato a deputado estadual. Gere a imagem no navegador, sem cadastro e sem enviar sua foto para servidor.
```

### `/metodo`

Title:

```txt
Método de organização popular | Missão ÉLuta
```

Description:

```txt
Conheça o método da pré-campanha Alexandre VR Abandonada: escuta, cuidado, organização popular, missões de base e participação territorial.
```

### `/formacao/campanhas-de-base`

Title:

```txt
Formação em campanhas de base | Missão ÉLuta
```

Description:

```txt
Formação sobre campanhas de base, escuta territorial e organização popular aplicada à pré-campanha Alexandre VR Abandonada.
```

## Proposta de `sitemap.ts`

Rotas prioritárias:

- `/`
- `/lancamento`
- `/apoio`
- `/metodo`
- `/formacao/campanhas-de-base`

Rotas condicionais:

- `/jogo`
- `/jogo/rua`

Campos:

- `url`
- `lastModified`
- `changeFrequency`
- `priority`

Prioridades sugeridas:

| Rota | Priority | Change frequency |
|---|---:|---|
| `/` ou `/lancamento` | 1.0 | daily/weekly durante pré-campanha |
| `/apoio` | 0.8 | weekly |
| `/metodo` | 0.7 | monthly |
| `/formacao/campanhas-de-base` | 0.6 | monthly |
| `/jogo` | 0.4 ou noindex | monthly |
| `/jogo/rua` | 0.4 ou noindex | monthly |

## Proposta de `robots.ts`

Diretriz:

- Permitir indexação geral.
- Incluir sitemap.
- Bloquear apenas caminhos técnicos se existirem.

Exemplo lógico:

```ts
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.alexandrevrabandonada.online/sitemap.xml",
  };
}
```

## Dados estruturados sugeridos

### `WebSite`

Usar no layout ou home:

- `name`: `Alexandre VR Abandonada`
- `url`: domínio oficial
- `inLanguage`: `pt-BR`

### `Person`

Usar na home/landing:

- `name`: `Alexandre VR Abandonada`
- `alternateName`: `Alexandre Fonseca`, se juridicamente/estrategicamente desejado
- `description`: pré-candidato a deputado estadual, sem pedido de voto
- `image`: imagem pública otimizada

### `Event`

Usar em `/lancamento`:

- `name`: `Lançamento da pré-campanha Alexandre VR Abandonada`
- `startDate`: `2026-07-04T14:00:00-03:00`
- `eventAttendanceMode`: presencial
- `eventStatus`: scheduled
- `location`: endereço do Conforto
- `organizer`: pré-campanha Alexandre VR Abandonada

### `FAQPage`

Usar para as dúvidas comuns já existentes.

Cuidados:

- Respostas devem bater exatamente com o texto visível.
- Não inserir promessa individual.
- Não pedir voto.

### `BreadcrumbList`

Usar nas páginas internas.

## Riscos eleitorais e de compliance

Evitar em SEO:

- `vote`
- `voto`
- `eleja`
- número eleitoral
- linguagem de candidatura oficial antes do período permitido
- promessa de benefício individual
- ataque a pessoa real

Usar:

- `pré-campanha`
- `pré-candidato a deputado estadual`
- `organização popular`
- `escuta`
- `território`
- `Volta Redonda`
- `Missão ÉLuta`

## Checklist de implementação

- [ ] Confirmar domínio oficial e configurar `NEXT_PUBLIC_SITE_URL`.
- [ ] Corrigir fallback em `app/layout.tsx`.
- [ ] Criar `app/robots.ts`.
- [ ] Criar `app/sitemap.ts`.
- [ ] Atualizar metadata de `/apoio`.
- [ ] Adicionar OG/Twitter específicos em `/metodo` e `/formacao`.
- [ ] Gerar OG raster 1200×630.
- [ ] Implementar JSON-LD com helper seguro.
- [ ] Decidir política de indexação dos jogos.
- [ ] Otimizar `alexandre-retrato.png`.
- [ ] Validar HTML renderizado.
- [ ] Rodar `npm run verify`.
- [ ] Enviar sitemap no Search Console.

## Recomendação objetiva

Próximo tijolo recomendado:

1. Implementar domínio correto, `robots.ts`, `sitemap.ts` e corrigir metadata de `/apoio`.
2. Em seguida, implementar JSON-LD em `/lancamento` e OG raster.
3. Depois decidir migração da home `/` para página canônica da pré-candidatura.

## Implementação realizada em 2026-06-30

Alterações aplicadas após este diagnóstico:

- Domínio oficial centralizado em `src/content/siteSeo.ts`.
- Fallback de produção corrigido para `https://www.alexandrevrabandonada.online`.
- `app/robots.ts` criado.
- `app/sitemap.ts` criado.
- Redirect da raiz `/` alterado para permanente.
- Metadados de `/lancamento`, `/apoio`, `/metodo`, `/formacao/campanhas-de-base`, `/jogo` e `/jogo/rua` revisados.
- Open Graph e Twitter cards migrados para PNG 1200×630.
- JSON-LD adicionado:
  - `WebSite` global.
  - `Person`, `Event` e `FAQPage` em `/lancamento`.
  - `BreadcrumbList` nas páginas internas.
- Jogos locais mantidos acessíveis, mas definidos como `noindex, follow`.
- `public/alexandre-retrato-hero.webp` criado para substituir a imagem PNG pesada no hero.

Arquivos criados:

- `app/robots.ts`
- `app/sitemap.ts`
- `src/content/siteSeo.ts`
- `src/components/seo/JsonLd.tsx`
- `public/alexandre-retrato-hero.webp`
- `public/og-lancamento.png`
- `public/og-apoio.png`
- `public/og-metodo.png`
- `public/og-formacao.png`
- `public/og-jogo.png`
- `public/og-jogo-rua.png`

Arquivos editados:

- `app/layout.tsx`
- `app/page.tsx`
- `app/lancamento/page.tsx`
- `app/apoio/page.tsx`
- `app/metodo/page.tsx`
- `app/formacao/campanhas-de-base/page.tsx`
- `app/jogo/page.tsx`
- `app/jogo/rua/page.tsx`

### Evidência pós-implementação

`npm run verify`: passou.

Rotas SEO:

| Rota | Status | Canonical | Robots | OG image | JSON-LD |
|---|---:|---|---|---|---:|
| `/` | 308 | n/a | n/a | n/a | 0 |
| `/lancamento` | 200 | `https://www.alexandrevrabandonada.online/lancamento` | `index, follow` | `/og-lancamento.png` | 4 |
| `/apoio` | 200 | `https://www.alexandrevrabandonada.online/apoio` | `index, follow` | `/og-apoio.png` | 4 |
| `/metodo` | 200 | `https://www.alexandrevrabandonada.online/metodo` | `index, follow` | `/og-metodo.png` | 4 |
| `/formacao/campanhas-de-base` | 200 | `https://www.alexandrevrabandonada.online/formacao/campanhas-de-base` | `index, follow` | `/og-formacao.png` | 4 |
| `/jogo` | 200 | `https://www.alexandrevrabandonada.online/jogo` | `noindex, follow` | `/og-jogo.png` | 4 |
| `/jogo/rua` | 200 | `https://www.alexandrevrabandonada.online/jogo/rua` | `noindex, follow` | `/og-jogo-rua.png` | 4 |
| `/robots.txt` | 200 | n/a | n/a | n/a | 0 |
| `/sitemap.xml` | 200 | n/a | n/a | n/a | 0 |

Imagem hero:

- Antes: `public/alexandre-retrato.png` com aproximadamente 3.2 MB.
- Depois: `public/alexandre-retrato-hero.webp` com aproximadamente 267 KB.

Status atual para SEO após implementação:

```txt
Pronto para indexação básica e envio ao Search Console.
```

Pendências para uma fase posterior:

- Validar JSON-LD no Rich Results Test.
- Validar previews sociais em WhatsApp/Facebook/X.
- Rodar Lighthouse/PageSpeed em produção após deploy.
- Decidir se `/` deve virar home canônica no médio prazo.
- Enviar sitemap no Google Search Console.
