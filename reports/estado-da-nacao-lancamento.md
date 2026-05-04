# Estado da Nação — Lançamento Missão ÉLuta

**Projeto:** `Landing Missao`  
**Gerado em:** 2026-05-04 (atualizado: redesign v2 completo)
**Contexto:** Página pública de lançamento da pré-campanha Alexandre VR Abandonada + app Missão ÉLuta

---

## 1. Diagnóstico executado

### Stack identificada (projetos irmãos)

| Projeto              | Stack                                     |
|---------------------|-------------------------------------------|
| VR Abandonada        | Next.js 15 App Router + TS + CSS vars     |
| Hub Jogos Pré Camp   | Next.js 14 App Router + TS + Tailwind     |
| missaoelutavibe      | Vite + React + Tailwind + shadcn/ui       |
| **Landing Missao**   | **Next.js 15 App Router + TS + CSS vars** |

### Identidade visual Missão ÉLuta
- **Fundo:** `#0B0B0E` (preto carvão)
- **Destaque:** `#FFD100` (amarelo luta)
- **Tensão:** `#C0392B` (vermelho ferrugem)
- **Fontes:** Oswald (headlines) · Inter (corpo)
- **Slogan:** `Escutar • Cuidar • Organizar`
- **Hashtag:** `#ÉLUTA`

---

## 2. Arquivos criados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `package.json` | Config | Dependências do projeto Next.js 15 |
| `next.config.ts` | Config | Configuração Next.js mínima |
| `tsconfig.json` | Config | TypeScript com path alias `@/*` |
| `.gitignore` | Config | Ignora `.next/`, `node_modules/` |
| `.eslintrc.json` | Config | ESLint com `next/core-web-vitals` |
| `content/launchEvent.ts` | **Conteúdo** | Config central do evento (dados placeholder) |
| `app/globals.css` | Estilo | Design system Missão ÉLuta (tokens + utilitários) |
| `app/layout.tsx` | Layout | Root layout com metadados OG/SEO |
| `app/page.tsx` | Rota | Redirect `/` → `/lancamento` |
| `app/lancamento/page.tsx` | **Página** | `LancamentoPage` — Server Component com leitura de querystring |
| `app/lancamento/ShareButtons.tsx` | Componente | Server Component — CTAs estáticos (links) |
| `app/lancamento/ViralBlock.tsx` | Componente | `'use client'` — Cartão viral + 3 botões share |
| `app/lancamento/CopyInfoBtn.tsx` | Componente | `'use client'` — Copiar informações do evento |
| `src/lib/shareLaunch.ts` | Helper | URL de lançamento, URL WhatsApp, signup com ref, clipboard safe |
| `src/components/launch/LaunchShareCard.tsx` | Componente | `'use client'` — Card vertical para print/story + modal fullscreen |
| `src/components/launch/LaunchActionStrip.tsx` | Componente | Faixa de CTA repetida para reforço de conversão |
| `public/og-lancamento.svg` | Asset | Imagem OG leve para compartilhamento |
| `reports/estado-da-nacao-lancamento.md` | Relatório | Este arquivo |

---

## 3. Rota criada

| Rota | Tipo | Componente |
|------|------|------------|
| `/lancamento` | Pública, estática | `LancamentoPage` |
| `/` | Redirect | → `/lancamento` |

A rota é **registrada automaticamente** pelo Next.js App Router pela pasta `app/lancamento/page.tsx`. Nenhum arquivo de rotas foi editado.

---

## 4. Build e verify

```
npm run typecheck   ✓  sem erros de tipo
npm run lint        ✓  sem warnings ou erros ESLint
npm run build       ✓  compilado em 1.4s, 5 páginas
```

Resultado do build:
```
Route (app)                    Size   First Load JS
○ /                           123 B        102 kB
ƒ /lancamento                 2.6 kB       105 kB
```

Status da rota:
- `/lancamento` agora é dinâmica (SSR on demand), pois lê `searchParams` (`ref`, `utm_source`, `utm_medium`, `utm_campaign`).

---

## 5. Compartilhamento rastreável e viral (v3)

Implementado no fluxo de `/lancamento`:

1. Leitura de querystring:
	- `ref`
	- `utm_source`
	- `utm_medium`
	- `utm_campaign`

2. Preservação de `ref` nos CTAs de entrada:
	- sem ref: `/auth?mode=signup&next=/voluntario`
	- com ref: `/auth?mode=signup&next=/voluntario&ref=...`

3. Botão WhatsApp (bloco viral):
	- usa link com `ref` quando presente
	- força UTMs de compartilhamento:
	  - `utm_source=whatsapp`
	  - `utm_medium=share`
	  - `utm_campaign=lancamento_app`

4. Botão copiar link:
	- copia URL limpa de `/lancamento`
	- mantém `ref` e UTMs recebidas na entrada

5. Botão copiar mensagem:
	- usa texto longo de convite, com assinatura da campanha
	- inclui `Vem conhecer: [LINK]` com URL rastreável

6. Helper reutilizável:
	- `src/lib/shareLaunch.ts`
	- funções:
	  - `buildLaunchUrl(baseUrl, ref?)`
	  - `buildLaunchWhatsAppUrl({ url, text })`
	  - `buildSignupUrl({ ref })`
	  - `copyToClipboardSafe(text)`

7. UI de convite:
	- badge no hero: `Convite recebido` quando `ref` existe
	- sem exibir o código técnico do `ref`

---

## 6. Verificações executadas

Validações realizadas em ambiente local:

1. `/lancamento`
	- CTA signup sem `ref`

2. `/lancamento?ref=ABC123&utm_source=test&utm_medium=unit&utm_campaign=camp`
	- badge `Convite recebido` visível
	- CTAs signup com `ref=ABC123`
	- copiar link retorna URL limpa com `ref` e UTMs de entrada
	- copiar mensagem retorna texto de convite com link rastreável
	- WhatsApp gera URL com UTMs fixas de share + `ref`

3. Build/SSR
	- `npm run verify` executado com sucesso
	- sem quebra de SSR ou tipagem

---

## 7. Componente visual compartilhável (v4)

Novo componente criado:
- `src/components/launch/LaunchShareCard.tsx`

Características implementadas:
1. Card vertical estilo story/poster (alto contraste, textura sutil, formas orgânicas amarelo/ferrugem)
2. Headline principal: `EU VOU` + `NO LANÇAMENTO`
3. Subtítulo: `Lançamento da pré-campanha + app Missão ÉLuta`
4. Nome: `Alexandre VR Abandonada`
5. Rodapé: `Escutar • Cuidar • Organizar`
6. Bloco de data/local usando dados de `launchEvent` (com fallback "a confirmar")

Funcionalidades:
1. `Abrir card em tela cheia`
2. `Copiar mensagem`
3. `Gerar print para Story` (exibido em mobile)

Decisão técnica (dependências):
- Não há `html-to-image`/canvas no projeto.
- Conforme diretriz, não foi adicionada dependência pesada.
- Foi aplicado fallback com fullscreen/modal + fluxo de copy/print.

Responsividade:
- Ajustes de largura e quebra de texto para evitar overflow em telas pequenas.
- Ações do card adaptadas para coluna única no mobile.

---

## 8. Como testar localmente

```bash
cd "c:\Projetos\Landing Missao"
npm run dev
# Abrir: http://localhost:3000/lancamento
```

---

## 9. Pendências de data e local

O arquivo `content/launchEvent.ts` contém os seguintes campos com placeholder:

| Campo | Placeholder atual | Ação necessária |
|-------|-----------------|-----------------|
| `dateLabel` | `DATA_A_CONFIRMAR` | Substituir pela data real (ex: `"15 de julho de 2026"`) |
| `timeLabel` | `HORARIO_A_CONFIRMAR` | Substituir pelo horário (ex: `"19h"`) |
| `locationLabel` | `LOCAL_A_CONFIRMAR` | Nome do espaço (ex: `"Centro Cultural VR"`) |
| `addressLabel` | `ENDERECO_A_CONFIRMAR` | Endereço completo |
| `whatsappNumber` | `""` (vazio) | Número com DDI, ex: `"5524999998888"`. Botão aparece automaticamente quando preenchido. |
| `appSignupPath` | `"#cadastro"` | URL real do app quando publicado |

A página detecta automaticamente quando os dados estão em placeholder e exibe o aviso:
> "Data e local em definição — confirme no cadastro para receber aviso."

---

## 10. Riscos eleitorais evitados

| Risco | Status |
|-------|--------|
| Pedido explícito de voto | ✅ Ausente em todo o código |
| Menção a "número de candidato" | ✅ Ausente |
| Qualificação como "candidato oficial" | ✅ Ausente |
| Termos "vote" / "eleja" / "eleição" | ✅ Ausente |
| Publicidade eleitoral antecipada | ✅ Rodapé inclui aviso legal explícito |
| Conteúdo partidário formal | ✅ FAQ esclarece independência partidária neste momento |

Linguagem usada: **"pré-campanha"**, **"movimento"**, **"organização popular"**, **"base coletiva"**, **"Alexandre VR Abandonada"**, **"Missão ÉLuta"**, **"Escutar • Cuidar • Organizar"**.

---

## 11. Próximos passos sugeridos

- [ ] Confirmar data, horário e local → atualizar `content/launchEvent.ts`
- [ ] Confirmar número WhatsApp → preencher `whatsappNumber`
- [ ] Publicar app → atualizar `appSignupPath` para URL real
- [ ] Adicionar imagem OG (`public/og-lancamento.png` — 1200×630)
- [ ] Configurar `NEXT_PUBLIC_SITE_URL` no `.env.local` com domínio real
- [ ] Deploy em Vercel ou equivalente

---

## 12. Hardening final (checklist)

### SEO básico
- [x] `title` da rota `/lancamento` definido como:
	- `Lançamento Missão ÉLuta | Pré-campanha Alexandre VR Abandonada`
- [x] `description` da rota definido como:
	- `Evento de lançamento da pré-campanha e do app Missão ÉLuta — Escutar, Cuidar e Organizar.`
- [x] Canonical ativo em `/lancamento` (`alternates.canonical`)

### Open Graph / Twitter
- [x] `og:title` configurado
- [x] `og:description` configurado
- [x] `og:type=website`
- [x] `twitter:card` configurado (`summary`)
- [ ] `og:image` não configurado (não há pasta `public/` com asset OG no projeto)

### Conteúdo seguro de pré-campanha
- [x] Sem uso de `vote`
- [x] Sem uso de `eleja`
- [x] Sem pedido explícito de voto
- [x] Sem promessa de benefício individual
- [x] Sem ataque à honra de adversários
- [x] Sem simulação de propaganda oficial de campanha
- [x] Linguagem mantida em `pré-campanha`

### Performance
- [x] Sem adição de imagens pesadas
- [x] Sem dependências novas pesadas
- [x] `prefers-reduced-motion` implementado (global + página `/lancamento`)

### Acessibilidade
- [x] Botões com `aria-label`
- [x] Foco visível (`:focus-visible`) global
- [x] Contraste alto mantido na paleta
- [x] Ordem de headings validada (`h1` -> `h2` -> `h3`)

### Testes funcionais executados
- [x] `/lancamento`
- [x] `/lancamento?ref=TESTE123`
- [x] Botões de copiar (`Copiar mensagem` e `Copiar link`)
- [x] Link de WhatsApp com UTMs + `ref`
- [x] CTA para `/auth?mode=signup&next=/voluntario` (com e sem `ref`)
- [x] `npm run verify` final

---

## 13. Polimento v5 (conversão, ritmo visual e viralização)

### Arquivos alterados no v5
- `app/lancamento/page.tsx`
- `app/lancamento/ShareButtons.tsx`
- `src/components/launch/LaunchShareCard.tsx`
- `src/components/launch/LaunchActionStrip.tsx`
- `public/og-lancamento.svg`
- `reports/estado-da-nacao-lancamento.md`

### Mudanças visuais
1. Hero com faixa compacta de `Data`, `Horário` e `Local` + microtexto de aviso.
2. Ritmo entre seções ajustado com menor respiro vertical no desktop (menos vazio contemplativo).
3. Nova seção `Você pode chegar de vários jeitos.` com 4 cards de entrada.
4. Card `EU VOU` refinado no terço inferior com:
	- bloco `DATA • LOCAL`
	- frase `Chame mais 3 pessoas.`
	- link visual curto `landingmissao.vercel.app/lancamento`
5. Open Graph visual configurado com `public/og-lancamento.svg`.

### Mudanças de conversão
1. Hero ganhou terceiro CTA visível: `Chamar mais 3 pessoas`.
2. Mensagem central atualizada para:
	- `Não é evento de palco. É ferramenta de organização.`
3. Componente `LaunchActionStrip` aplicado em 2 pontos:
	- após `Como o app funciona`
	- antes do FAQ
4. Reforço de trilha curta de ação com botões:
	- `Quero participar`
	- `Entrar no app`
	- `Compartilhar`

### Riscos eleitorais evitados
- Sem `vote`, `eleja`, pedido explícito de voto ou número.
- Sem promessa de benefício individual.
- Sem ataque à honra de adversários.
- Sem simular propaganda oficial de campanha.
- Linguagem mantida como organização de `pré-campanha`.

### Testes executados no v5
1. `/lancamento`
2. `/lancamento?ref=TESTE123`
3. CTA `/auth` com e sem `ref`
4. Botão WhatsApp (URL com UTMs + `ref`)
5. Botões `Copiar mensagem` e `Copiar link`
6. Card em tela cheia (modal abre/fecha)
7. `npm run verify` (typecheck + lint + build)

### Pendências restantes
1. Substituir placeholders de data/horário/local no `content/launchEvent.ts`.
2. Confirmar domínio final em `NEXT_PUBLIC_SITE_URL` para canonical/OG em produção.
3. Opcional: gerar versão PNG da OG para plataformas com parsing SVG inconsistente.
