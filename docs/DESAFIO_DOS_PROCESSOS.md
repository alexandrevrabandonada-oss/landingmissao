# Desafio dos Processos

- URL pública: `https://www.alexandrevrabandonada.online/jogos/fuga-da-burocracia`. A rota `/jogo` continua com a experiência anterior e oferece um link para o desafio.
- O build Unity estático da versão 1 fica em `public/unity/fuga/v1`. `next.config.ts` envia `Content-Encoding: gzip` e MIME correto aos três arquivos comprimidos. Preserve essa pasta quando uma versão futura for lançada, para que convites antigos continuem abrindo o mesmo percurso. As imagens do card e da prévia ficam em `public/unity/fuga`.
- O modo curto é ativado por `mode=challenge`. A página passa `day=AAAA-MM-DD` e `target=<pontos>` ao iframe. O link compartilhado também inclui `v=1`; o alvo é uma marca enviada por um amigo, não um recorde autenticado.
- A página aceita `postMessage` apenas do iframe de mesma origem. Eventos: `loading`, `ready`, `start`, `retry`, `share` e `result`. O resultado informa data, pontuação e melhor marca local. A página oferece compartilhamento nativo/cópia de link e exporta um card PNG vertical.
- Eventos agregáveis via `trackEventIfAvailable`: `challenge_opened`, `challenge_link_opened`, `challenge_started`, `challenge_finished`, `challenge_replayed`, `challenge_share_clicked` e `challenge_card_downloaded`. A coleta agregada depende de provedor de analytics configurado; o código atual emite os eventos, mas não armazena registros no servidor.
- Rota local de verificação geométrica: abrir o build diretamente em localhost com `?mode=challenge&qa=1&day=2026-09-28`; o modo QA não ativa em domínio público.
- Antes do lançamento amplo, testar a página em Android/iOS reais e executar piloto com 30–50 pessoas. Não tratar o score recebido por URL como ranking público.
- A atualização visual de 28/09/2026 melhorou o contraste do HUD, as silhuetas do Alexandre e dos advogados, a leitura de cafés, processos e plataformas e os controles móveis. As regras e o percurso da versão 1 não mudaram.
