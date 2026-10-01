# Beta pública de VR: Cidade em Disputa

Implementação na branch `feat/vr-cidade-public-beta`, baseada na main `881d733`. O clone antigo com trabalho local foi preservado. O runtime Unity fica no projeto Vercel independente `vr-cidade-em-disputa-web`, sem binários WebGL neste repositório.

Entrada: `/jogar/cidade-em-disputa`. Origem padrão: `https://jogo.alexandrevrabandonada.online`. O override `NEXT_PUBLIC_CITY_GAME_ORIGIN` é usado somente para QA de outra origem; não deve ser definido numa promoção para o domínio canônico.

O card com screenshot real fica antes de MissionSelector. Home e entrada não baixam Unity antes de INICIAR JOGO. Metadados/changelog são obtidos de `/release.json` e `/releases.json`. O iframe é criado após o clique; mensagens validam origem e janela. CSP autoriza apenas origens explícitas, e o jogo não registra service worker.

Feedback usa a infraestrutura Supabase já existente, através da API Next e edge function `game-beta-public`. Schema `game_beta` privado, RLS, gravação somente por backend. Métricas agregadas, sem escolhas do RPG ou vínculo com perfil político. Nenhum bypass de preview, profile de navegador ou secret entra no deployment. `.vercelignore` exclui docs, scripts, relatórios, output, profiles e arquivos privados.

QA Playwright em `scripts/qa-game-beta-*.js`: preload/Home, seis viewports, cena real, fullscreen/ESC, save real F5/F9 após refresh, falha de WASM/retry, versão/feedback/clipboard. Scripts derivam o host do link do wrapper, permitindo verificar preview e produção sem alterar o runtime. Evidências e relatório completo estão no projeto do jogo, `docs/PUBLIC_BETA_WEB_RELEASE.md` e `docs/public-beta/`.

As verificações mobile são emulação de viewport em Chrome, sem alegação de testes físicos iOS/Android. Warnings existentes de climatização e Unity/WebGL são separados dos erros da aplicação. Releases usam URL raiz estável; não limpar os dados do navegador e não assumir transferência automática de saves entre o host alternativo Vercel e o domínio próprio.

Rollback da landing: promover o deployment anterior `landingmissao-fip407eyu-alexandrevrabandonada-oss-projects.vercel.app` no scope `alexandrevrabandonada-oss-projects`. O domínio separado do jogo e os saves permanecem independentes. Rollback do jogo e compatibilidade de schema devem seguir o relatório do jogo.
