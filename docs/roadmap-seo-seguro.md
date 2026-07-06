# Roadmap seguro de SEO

## 1. Base tecnica

- Usar `/` como URL principal da pre-campanha.
- Redirecionar rotas antigas de lancamento para a home.
- Manter title, description, canonical, Open Graph e Twitter Card por pagina.
- Publicar `sitemap.xml` somente com paginas indexaveis.
- Manter jogos e experiencias auxiliares como `noindex` quando nao forem paginas de aquisicao.

## 2. Conteudo indexavel

- Home: apresentar a pre-campanha como movimento em andamento.
- Quem e Alexandre: consolidar a busca nominal por Alexandre VR Abandonada.
- Pre-campanha em Volta Redonda: capturar buscas territoriais.
- Missao ELuta: explicar o app e o metodo de organizacao.
- Participar: concentrar voluntariado, grupo, apoio e proximos passos.
- Pautas: organizar os temas publicos sem promessa eleitoral.
- Perguntas frequentes: responder duvidas de busca e reforcar confianca.

## 3. Dados estruturados

- `Person` para Alexandre VR Abandonada.
- `Organization` para a pre-campanha.
- `BreadcrumbList` nas paginas internas.
- `FAQPage` nas paginas com perguntas frequentes.
- Evitar `Event` depois do lancamento, porque o evento ja ocorreu.

## 4. Performance e qualidade

- Remover fontes remotas bloqueantes.
- Priorizar a imagem principal da home com `priority` e tamanho responsivo.
- Usar imagens OG especificas por pagina.
- Validar `typecheck`, `build` e Lighthouse em ambiente de producao local.
- Monitorar LCP, SEO, acessibilidade e boas praticas antes de publicar.

## 5. Distribuicao segura

- Enviar `https://www.alexandrevrabandonada.online/sitemap.xml` no Google Search Console.
- Inspecionar e solicitar indexacao das paginas principais.
- Usar links oficiais para a home, nao para rotas antigas de lancamento.
- Padronizar UTMs:
  - WhatsApp: `/?utm_source=whatsapp&utm_medium=share&utm_campaign=pre_campanha_alexandre_vr_abandonada`
  - Instagram: `/?utm_source=instagram&utm_medium=bio&utm_campaign=pre_campanha_alexandre_vr_abandonada`
  - Apoiadores: `/?utm_source=apoiador&utm_medium=link&utm_campaign=pre_campanha_alexandre_vr_abandonada`
- Evitar spam, promessa de voto, numero eleitoral ou linguagem de campanha oficial antes do periodo permitido.

## 6. Rotina de acompanhamento

- Semanal: revisar Search Console, termos de busca e paginas com impressao.
- Semanal: atualizar FAQ com perguntas reais recebidas no WhatsApp, app e redes.
- Quinzenal: publicar ou adaptar uma pauta territorial com link interno.
- Mensal: revisar titles, descriptions, links quebrados e performance.
