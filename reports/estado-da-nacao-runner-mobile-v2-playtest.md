# Estado da Nação — Runner Mobile v2 Playtest

## Arquivos alterados

- `app/jogo/rua/page.tsx`
- `app/jogo/rua/GameRuaEntry.tsx`
- `src/features/game-rua/GameRuaExperience.tsx`
- `reports/checklist-qa-runner-mobile.md`

## Arquivos criados

- `reports/roteiro-playtest-runner-mobile.md`
- `reports/estado-da-nacao-runner-mobile-v2-playtest.md`

## Modo debug criado

Suporte a:

- `/jogo/rua?debug=1`

Quando ativo, o runner passa a mostrar painel discreto com:

- FPS aproximado
- faixa atual
- estado atual
- velocidade
- tempo de partida
- último gesto detectado
- distância
- obstáculos gerados
- colisões
- motivo de derrota

Quando `debug` não existe, o painel não aparece.

## Modo playtest criado

Suporte a:

- `/jogo/rua?playtest=1`

Quando ativo, a tela final passa a mostrar:

- botão `Copiar resumo do teste`

O resumo copiado inclui:

- tempo sobrevivido
- resultado
- relatos coletados
- obstáculos desviados
- easter eggs encontrados
- se usou swipe ou botões
- largura e altura da tela
- user agent resumido
- `ref`
- campo manual:
  - `Observação do jogador: ______`

Nada disso é enviado para servidor.

## Roteiro criado

Arquivo:

- `reports/roteiro-playtest-runner-mobile.md`

Conteúdo:

- objetivo do teste
- instrução para observador
- instrução para jogador
- 8 perguntas rápidas
- tabela para 5 testes

## Checklist atualizado

Arquivo:

- `reports/checklist-qa-runner-mobile.md`

Nova seção adicionada:

- `Playtest 5 pessoas`

Campos incluídos:

- jogador 1
- jogador 2
- jogador 3
- jogador 4
- jogador 5
- taxa de entendimento
- taxa de conclusão
- taxa de vontade de compartilhar
- principais travas

## Smoke executado

### Rotas

- `/jogo/rua` -> `200`
- `/jogo/rua?debug=1` -> `200`
- `/jogo/rua?playtest=1` -> `200`
- `/jogo/rua?ref=TESTE123&playtest=1` -> `200`
- `/lancamento` -> `200`

### Verify

- `npm run verify` -> OK

### Checks adicionais

- `ref=TESTE123` continua presente no fluxo do runner
- `utm_content=runner_rua` continua presente
- landing continua com:
  - `Melhor no celular`
  - `Modo Rua`
  - `Modo Retrô`

## Observação de validação

Os modos `debug` e `playtest` são renderizados em componente client-only. Então:

- a rota responde `200`
- o código do modo existe e compila
- mas a simples inspeção do HTML cru da resposta não prova visualmente o painel nem o botão final

Para validar isso de ponta a ponta ainda falta um playtest manual com o jogo realmente rodando até o fim.

## Pendências reais

- falta playtest manual em 3 a 5 pessoas
- falta validar o botão `Copiar resumo do teste` na prática, após derrota e vitória
- falta validar share sheet nativo em aparelho físico
- falta medir taxa real de entendimento, conclusão e vontade de compartilhar

## Recomendação objetiva

`pronto para playtest manual`

Não recomendo ainda abrir beta público amplo antes de executar os 3 a 5 testes reais previstos neste pacote.
