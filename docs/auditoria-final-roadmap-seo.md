# Auditoria final do roadmap seguro de SEO

Data da verificacao: 2026-07-06

## Evidencias tecnicas verificadas

- Home publica: `https://www.alexandrevrabandonada.online/` respondeu `200`.
- Busca publica `site:alexandrevrabandonada.online` ja retorna a home do projeto.
- `robots.txt` publico permite indexacao e aponta para o sitemap.
- `sitemap.xml` publico responde e lista as paginas principais.
- `/lancamento` redireciona para `/` com status `308`.
- `/pre-campanha` redireciona para `/` com status `308`.
- Paginas estrategicas publicas responderam `200`:
  - `/quem-e-alexandre-vr-abandonada`
  - `/pre-campanha-volta-redonda`
  - `/missao-eluta`
  - `/participar`
  - `/pautas`
  - `/perguntas-frequentes`
- Home publicada possui:
  - Title focado em Alexandre, pre-campanha e Volta Redonda.
  - Meta description clara e sem linguagem eleitoral inadequada.
  - Canonical para o dominio principal.
  - Open Graph com `og-pre-campanha.png`.
  - Um unico `h1`.
  - Nenhum schema `Event`.
  - Nenhuma referencia publica a lancamento.

## Evidencias de build e qualidade

- `npm run typecheck` passou durante a execucao do roadmap.
- `npm run build` passou apos as alteracoes finais.
- Lighthouse em producao local registrou:
  - Performance: 97
  - Acessibilidade: 100
  - Boas praticas: 96
  - SEO: 100
- LCP medido em 2.3s, CLS em 0 e SEO tecnico em 100.

## Artefatos criados

- `docs/roadmap-seo-seguro.md`
- `docs/execucao-search-console-e-distribuicao.md`
- `docs/seo-distribuicao-links.json`

## Pendencias externas

Estas etapas dependem de acesso a contas e canais oficiais:

- Enviar `https://www.alexandrevrabandonada.online/sitemap.xml` no Google Search Console.
- Solicitar indexacao das URLs listadas em `docs/seo-distribuicao-links.json`.
- Acompanhar a indexacao das paginas internas, que ainda podem nao aparecer em busca publica logo apos o deploy.
- Monitorar Search Console semanalmente.
- Atualizar links em perfis publicos oficiais.
- Distribuir links com UTMs nos canais reais de WhatsApp, Instagram, Facebook, materiais de voluntarios e apoiadores.
- Buscar links legitimos em coletivos, blogs, imprensa local e paginas de apoiadores.

## Regra de seguranca

A pagina deve continuar usando linguagem de pre-campanha, sem pedido de voto, sem numero eleitoral e sem simulacao de candidatura oficial.
