# Estado da Nacao - Ferramenta de Apoio com Perfil Circular

Data: 23 de junho de 2026

## Objetivo

Adaptar a ferramenta de foto de apoio para gerar uma versao circular, adequada para foto de perfil do WhatsApp e reaproveitavel em Instagram, Facebook e TikTok.

## Decisao tecnica

- A ferramenta exporta PNG quadrado em 1080x1080.
- O modelo circular desenha uma moldura segura dentro do quadrado.
- A foto fica centralizada dentro da area circular interna.
- Textos e elementos importantes ficam afastados dos cantos para evitar cortes no recorte circular das redes sociais.
- O arquivo continua sendo processado localmente no navegador, sem upload para servidor.

## Modelos disponiveis

- Perfil forte: composicao quadrada com impacto visual.
- Perfil limpo: composicao quadrada mais leve.
- Perfil circular: moldura circular para avatar e foto de perfil.

## Compatibilidade

- WhatsApp: usa imagem quadrada com recorte circular no perfil.
- Instagram: usa imagem quadrada com recorte circular no perfil.
- Facebook: usa imagem quadrada com recorte circular no perfil.
- TikTok: usa imagem quadrada com recorte circular no perfil.

## Testes visuais

Foram gerados exports com foto real e validacao visual em desktop e mobile.

Arquivos de QA local:

- `reports/qa/apoio/perfil-circular-export-final.png`
- `reports/qa/apoio/perfil-circular-page-final.png`
- `reports/qa/apoio/perfil-circular-mobile-390-v2.png`

## Cuidados eleitorais

- Nao ha pedido de voto.
- Nao ha numero eleitoral.
- Nao ha ranking, cadastro ou coleta de dados pessoais.
- A pessoa faz upload local da propria foto e baixa o resultado no proprio dispositivo.

## Verificacao

`npm run verify` executado com sucesso:

- Typecheck OK
- Lint OK
- Build OK

