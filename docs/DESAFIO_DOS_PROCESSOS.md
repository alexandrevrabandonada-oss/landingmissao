# Desafio dos Processos

- A v3 inclui seis falas brasileiras sintetizadas com Microsoft Daniel, tocadas no lançamento efetivo do processo. Canal exclusivo impede sobreposição; frases alternam sem repetir a anterior, com tom por advogado e legenda na faixa superior. O menu oferece Falas ON/OFF com preferência local. Os clipes são mono a 22 kHz e ficam incluídos no build; não há síntese nem requisição de voz durante a partida.

- A página inicial oferece um atalho na apresentação e uma entrada visual em `/#desafio-dos-processos`, antes das missões, com arte v3 e botão “Jogar agora”. O Unity só é carregado ao abrir a página do jogo.

- URL pública: `https://www.alexandrevrabandonada.online/jogos/fuga-da-burocracia`. A rota `/jogo` continua com a experiência anterior e oferece um link para o desafio.
- Os builds estáticos ficam em `public/unity/fuga/v1`, `public/unity/fuga/v2` e `public/unity/fuga/v3`. `next.config.ts` envia `Content-Encoding: gzip` e MIME correto aos arquivos comprimidos. Links antigos com `v=1` e `v=2` continuam abrindo seus builds; links sem versão usam `v=3`.
- O modo curto é ativado por `mode=challenge`. A página passa `day=AAAA-MM-DD` e `target=<pontos>` ao iframe. O link compartilhado inclui a versão; o alvo é uma marca enviada por um amigo, não um recorde autenticado.
- A página aceita `postMessage` apenas do iframe de mesma origem. Eventos: `loading`, `ready`, `start`, `retry`, `share` e `result`. O resultado informa data, pontuação, melhor marca local e, nas versões 2 e 3, se o jogador sobreviveu. A página oferece compartilhamento nativo/cópia de link e exporta um card PNG vertical.
- Eventos agregáveis via `trackEventIfAvailable`: `challenge_opened`, `challenge_link_opened`, `challenge_started`, `challenge_finished`, `challenge_replayed`, `challenge_share_clicked` e `challenge_card_downloaded`. A coleta agregada depende de provedor de analytics configurado; o código atual emite os eventos, mas não armazena registros no servidor.
- Rota local de verificação geométrica: abrir o build diretamente em localhost com `?mode=challenge&qa=1&day=2026-09-28`; o modo QA não ativa em domínio público.
- Antes do lançamento amplo, testar a página em Android/iOS reais e executar piloto com 30–50 pessoas. Não tratar o score recebido por URL como ranking público.
- A atualização visual de 28/09/2026 melhorou o contraste do HUD, as silhuetas do Alexandre e dos advogados, a leitura de cafés, processos e plataformas e os controles móveis. As regras e o percurso da versão 1 não mudaram.
- A versão 2 acrescenta cinco poses compactas de Alexandre, gestos próprios de antecipação e recuperação dos advogados, reações e carimbos de sátira fictícia. O card e a prévia receberam uma composição nova; física, percurso de 45 segundos e pontuação seguem equivalentes. Os recordes locais são separados por versão.
- A versão 3 mantém a física e pontuação da v2, acrescenta sátira social fictícia em quatro momentos e um modo de leitura com contraste, texto maior e menos efeitos. O recorde local da v3 começa com o maior valor da v2 para a mesma data. Links explícitos `v=1` e `v=2` continuam nos builds originais; links novos e sem versão usam `v=3`.
- A página de resultado prioriza desafiar um amigo e oferece a história pessoal de Alexandre como link secundário. O PDF de referência e dados dos processos não são publicados; a apresentação pessoal fica na página “Quem é Alexandre”. Três clipes novos estão na pasta `SocialClips` do projeto Unity.
- Recuperação de carregamento: a v3 comunica falhas do loader/Unity à página. O botão de nova tentativa mantém versão, data e alvo; após 45 segundos sem avanço, a página oferece aguardar ou tentar de novo, sem declarar falha nem cancelar uma conexão lenta.

- Controle móvel v3: deslize para cima para pular; botão de pulo removido. Movimentos curtos/laterais/para baixo são ignorados; um pulo por deslize. No modo história, direção e corrida continuam com controles separados.
