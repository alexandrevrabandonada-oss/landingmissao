# Checklist QA — Runner Mobile

## iPhone / Safari

- [ ] `/jogo/rua` abre sem overflow lateral
- [ ] swipe esquerda troca 1 faixa
- [ ] swipe direita troca 1 faixa
- [ ] swipe para cima pula sem acionar troca de faixa
- [ ] swipe para baixo abaixa sem scroll da página
- [ ] toque curto não dispara comando acidental
- [ ] botões `←`, `→`, `Pular`, `Abaixar` são confortáveis
- [ ] tela final cabe inteira sem overflow
- [ ] `Compartilhar resultado` abre share sheet

## Android / Chrome

- [ ] `/jogo/rua` abre sem overflow lateral
- [ ] swipe esquerda troca 1 faixa
- [ ] swipe direita troca 1 faixa
- [ ] swipe para cima pula sem conflito
- [ ] swipe para baixo abaixa sem conflito
- [ ] sem scroll dentro da área jogável durante o gesto
- [ ] controles alternativos não cobrem informação crítica
- [ ] `WhatsApp` abre share corretamente

## Desktop

- [ ] `/jogo` continua funcionando
- [ ] `/jogo/rua` responde a `A/D`, setas, espaço e seta baixo
- [ ] tutorial inicial é compreensível em menos de 10 segundos
- [ ] reiniciar funciona
- [ ] derrota e vitória mostram tela final utilizável

## Share

- [ ] `Compartilhar resultado` funciona
- [ ] `WhatsApp` usa mensagem do runner
- [ ] `Facebook` usa link do runner
- [ ] `Instagram` copia mensagem e abre fallback
- [ ] `TikTok` copia mensagem e abre fallback
- [ ] `Copiar link` funciona
- [ ] `Copiar mensagem` funciona

## Tracking e links

- [ ] `ref` é preservado em `/jogo/rua?ref=TESTE123`
- [ ] `utm_source=game`
- [ ] `utm_medium=share`
- [ ] `utm_campaign=pre_campanha_alexandre_vr_abandonada`
- [ ] `utm_content=runner_rua`
- [ ] `Entrar no app` funciona
- [ ] `Receber primeira missão` funciona

## Reduced motion

- [ ] `prefers-reduced-motion` mostra fallback estático
- [ ] fallback mantém CTA do app
- [ ] fallback mantém botão de compartilhar

## Partida

- [ ] jogador casual sobrevive pelo menos 20–30 segundos
- [ ] partida média fica entre 45 e 75 segundos
- [ ] sem obstáculo impossível no começo
- [ ] sem sequência pular + abaixar muito rápida no começo
- [ ] power-ups aparecem com frequência útil
- [ ] tela de derrota permite compartilhar e reiniciar

## Playtest 5 pessoas

- [ ] jogador 1
- [ ] jogador 2
- [ ] jogador 3
- [ ] jogador 4
- [ ] jogador 5
- [ ] taxa de entendimento
- [ ] taxa de conclusão
- [ ] taxa de vontade de compartilhar
- [ ] principais travas
