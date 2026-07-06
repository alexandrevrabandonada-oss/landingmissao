# Execucao segura: Search Console e distribuicao

Este documento transforma a fase externa do roadmap em checklist operacional. Ele deve ser usado depois de cada deploy em producao.

## 1. URLs para Search Console

Propriedade recomendada: `https://www.alexandrevrabandonada.online/`

Enviar sitemap:

```text
https://www.alexandrevrabandonada.online/sitemap.xml
```

Inspecionar e solicitar indexacao destas URLs:

```text
https://www.alexandrevrabandonada.online/
https://www.alexandrevrabandonada.online/quem-e-alexandre-vr-abandonada
https://www.alexandrevrabandonada.online/pre-campanha-volta-redonda
https://www.alexandrevrabandonada.online/missao-eluta
https://www.alexandrevrabandonada.online/participar
https://www.alexandrevrabandonada.online/pautas
https://www.alexandrevrabandonada.online/perguntas-frequentes
https://www.alexandrevrabandonada.online/apoio
https://www.alexandrevrabandonada.online/metodo
https://www.alexandrevrabandonada.online/formacao/campanhas-de-base
```

Nao solicitar indexacao de:

```text
https://www.alexandrevrabandonada.online/lancamento
https://www.alexandrevrabandonada.online/pre-campanha
https://www.alexandrevrabandonada.online/jogo
https://www.alexandrevrabandonada.online/jogo/rua
```

Motivo: rotas antigas redirecionam ou experiencias auxiliares nao sao paginas principais de aquisicao.

## 2. Links externos padronizados

Home principal sem UTM:

```text
https://www.alexandrevrabandonada.online/
```

WhatsApp:

```text
https://www.alexandrevrabandonada.online/?utm_source=whatsapp&utm_medium=share&utm_campaign=pre_campanha_alexandre_vr_abandonada
```

Instagram bio:

```text
https://www.alexandrevrabandonada.online/?utm_source=instagram&utm_medium=bio&utm_campaign=pre_campanha_alexandre_vr_abandonada
```

Instagram stories:

```text
https://www.alexandrevrabandonada.online/?utm_source=instagram&utm_medium=story&utm_campaign=pre_campanha_alexandre_vr_abandonada
```

Facebook:

```text
https://www.alexandrevrabandonada.online/?utm_source=facebook&utm_medium=post&utm_campaign=pre_campanha_alexandre_vr_abandonada
```

Materiais de voluntarios:

```text
https://www.alexandrevrabandonada.online/?utm_source=voluntarios&utm_medium=material&utm_campaign=pre_campanha_alexandre_vr_abandonada
```

Apoiadores e perfis publicos:

```text
https://www.alexandrevrabandonada.online/?utm_source=apoiador&utm_medium=link&utm_campaign=pre_campanha_alexandre_vr_abandonada
```

## 3. Locais seguros para linkar

- Bio de Instagram, TikTok e Facebook.
- Descricao de grupos oficiais de WhatsApp.
- Materiais de apresentacao da pre-campanha.
- Paginas de coletivos locais, quando houver relacao real.
- Blogs, portais e imprensa local, quando o conteudo for editorial e verificavel.
- Perfis publicos de apoiadores, sem automacao em massa.

## 4. Regras de seguranca de texto

Usar:

- "Conheca a pre-campanha."
- "Participe da organizacao."
- "Entre no grupo de voluntarios."
- "Conheca as pautas em escuta."
- "Ajude a construir com responsabilidade."

Evitar:

- Pedido de voto.
- Numero eleitoral.
- Simulacao de campanha oficial.
- Promessa de resultado.
- Disparo em massa ou comentario repetitivo.

## 5. Monitoramento semanal

Toda semana, conferir no Search Console:

- Paginas indexadas.
- Consultas por "Alexandre VR Abandonada".
- Consultas com "Volta Redonda".
- CTR de `/`, `/quem-e-alexandre-vr-abandonada` e `/pre-campanha-volta-redonda`.
- Erros de cobertura.
- URLs descobertas, mas nao indexadas.

Depois da leitura, ajustar apenas com base em evidencia:

- Title se houver muita impressao e baixo CTR.
- FAQ se surgirem perguntas reais.
- Pautas se uma busca territorial aparecer com frequencia.
- Links internos se uma pagina importante estiver isolada.
