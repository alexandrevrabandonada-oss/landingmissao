# Estado da Nação - Jogo QA v2

## Ajustes Feitos
- Reduzi a fricção da primeira partida com curva inicial mais amigável.
- Aumentei a margem de erro de colisão para evitar perdas injustas.
- Adicionei uma janela inicial mais segura antes do primeiro obstáculo pesado.
- Ajustei o movimento horizontal do personagem para ficar mais responsivo no jogo casual.
- Protegi a área do jogo com `touch-action: none`, `user-select: none` e `overscroll-behavior: contain`.
- Melhorei o carregamento mobile do bloco inicial de `/jogo` para evitar aperto visual.
- Criei um teaser estático mais forte em `/lancamento` com thumbnail, copy curta e CTA secundário.

## Bugs Encontrados
- A primeira versão estava um pouco punitiva para jogador casual.
- O teaser de `/lancamento` precisava de mais presença visual para vender o jogo sem carregar runtime.
- O card inicial de `/jogo` pedia melhor largura e quebra em telas pequenas.

## Bugs Corrigidos
- Dificuldade suavizada sem trocar engine nem mexer na estrutura principal do jogo.
- Teaser da landing ganhou preview estático e botão `Depois entrar no app`.
- O estado de carregamento de `/jogo` ganhou largura explícita e quebra mais segura.

## Pendências Reais
- Validar em iPhone físico o comportamento do share sheet e da barra segura inferior.
- Validar em Android físico o fluxo completo de share com WhatsApp, Instagram e TikTok.
- Confirmar em dispositivo real a sensação do pulo e a dificuldade final da fase.

## Verificação
- `npm run verify` passou.
- Build finalizou com sucesso.
- Tipagem e lint também passaram sem erros.

## Recomendação
pronto para beta público

