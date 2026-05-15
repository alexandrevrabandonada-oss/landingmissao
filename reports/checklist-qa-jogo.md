# Checklist QA - Jogo

## PC
- [ ] Abrir `/jogo` em 1366x768
- [ ] Abrir `/jogo` em 1440x900
- [ ] Abrir `/jogo` em 1920x1080
- [ ] Confirmar que o canvas centraliza sem overflow horizontal
- [ ] Confirmar que o HUD fica legível
- [ ] Confirmar que `A/D`, setas e `Espaço` funcionam
- [ ] Confirmar que `Reiniciar` reinicia a partida
- [ ] Confirmar que `Sair` volta para a landing

## Android
- [ ] Abrir `/jogo` em 360x740
- [ ] Abrir `/jogo` em 390x844
- [ ] Abrir `/jogo` em 412x915
- [ ] Confirmar que a área do jogo não rola enquanto joga
- [ ] Confirmar que os botões fixos não cobrem obstáculos importantes
- [ ] Confirmar que o botão `Pular` é confortável
- [ ] Confirmar que tocar no jogo não seleciona texto
- [ ] Confirmar que `Compartilhar resultado` abre compartilhamento ou fallback

## iPhone / iOS Safari
- [ ] Abrir `/jogo` em 390x844
- [ ] Confirmar que `touch-action: none` impede scroll acidental no jogo
- [ ] Confirmar que a barra segura inferior não cobre os controles
- [ ] Confirmar que o share final funciona com o share sheet do iOS
- [ ] Confirmar que o fallback copia texto/link se o share sheet não abrir

## WhatsApp
- [ ] Confirmar botão `WhatsApp` no resultado final
- [ ] Confirmar preservação de `ref` no link compartilhado
- [ ] Confirmar `utm_source=game`
- [ ] Confirmar `utm_medium=share`
- [ ] Confirmar `utm_campaign=pre_campanha_alexandre_vr_abandonada`

## Instagram
- [ ] Confirmar botão `Instagram` no resultado final
- [ ] Confirmar fallback de copiar mensagem + abrir destino
- [ ] Confirmar que o link compartilhável carrega a rota do jogo

## TikTok
- [ ] Confirmar botão `TikTok` no resultado final
- [ ] Confirmar fallback de copiar mensagem + abrir destino
- [ ] Confirmar que o link compartilhável carrega a rota do jogo

## Reduced Motion
- [ ] Ativar `prefers-reduced-motion`
- [ ] Confirmar fallback estático
- [ ] Confirmar presença de `Compartilhar resultado`
- [ ] Confirmar presença de `Entrar no app`
- [ ] Confirmar presença de `Receber primeira missão`

## Ref / UTM
- [ ] Entrar na landing com `ref`
- [ ] Clicar em `Jogar agora`
- [ ] Confirmar preservação de `ref` na rota do jogo
- [ ] Confirmar preservação de `ref` nos links para o app
- [ ] Confirmar UTM de share no resultado final

## Links Para O App
- [ ] Confirmar `Entrar no app`
- [ ] Confirmar `Receber primeira missão`
- [ ] Confirmar `Compartilhar com 3 pessoas`
- [ ] Confirmar CTA secundário da landing `Depois entrar no app`

