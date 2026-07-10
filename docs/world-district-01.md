# Distrito 01 — Entre a Fábrica e o Jardim

## Escopo desta entrega

Vertical slice da rota `/explorar`, isolado da landing principal. A entrega prova o avatar jogável, a travessia entre paisagem industrial e solarpunk, três pontos narrativos, HUD DOM, mapa espacial, persistência mínima e fallback sem WebGL.

## Direção visual — cicatriz e germinação

O distrito foi recomposto como três territórios contínuos, lidos pela arquitetura, cor e luz:

1. **Fábrica:** galpões, chaminés, tubulações, reservatório e concreto frio estabelecem escala, memória e conflito.
2. **Transição:** oficina ocupada, mural, bancos, horta inicial e reparos tornam visível a passagem do abandono para o uso comum.
3. **Jardim:** água, canteiros, árvores, painéis solares, edifício comunitário e horizonte dourado abrem a paisagem para o futuro desejado.

A cicatriz amarela no piso conecta as três áreas. Os marcos deixaram de ser apenas anéis genéricos: memória, pauta e missão têm silhuetas próprias e continuam identificáveis pela cor de apoio.

Na segunda evolução visual, céu, neblina, luz ambiente e cor do HUD passam a responder à posição do jogador. A fábrica começa fria e ferruginosa; a transição ganha amarelos de oficina e mutirão; o jardim termina com luz mais quente e verdes abertos. Poeira, pólen, fissuras, entulho instanciado, bandeiras e pulsação dos marcos criam movimento sem pós-processamento pesado.

Na terceira evolução, o solo ganhou poças de baixa rugosidade, sombras falsas instanciadas e sombra própria do avatar. Luminárias reaproveitadas marcam a passagem para a zona de transição e um cordão de luz comunitário reforça o horizonte do jardim. Esses elementos usam geometrias pequenas e emissão visual com material básico, sem acrescentar novas luzes dinâmicas ao shader principal.

Na quarta evolução, chaminés ganharam fumaça por pontos, o canal de água recebeu brilhos animados e o jardim passou a produzir energia com um rotor eólico low-poly. A qualidade equilibrada reduz a quantidade de partículas e reflexos; a detalhada aumenta esses elementos sem alterar conteúdo ou navegação.

Na quinta evolução, a câmera passou a abrir altura, distância, campo de visão e antecipação conforme o avanço entre as zonas. Totens físicos sinalizam fábrica, mutirão e jardim; a vegetação repetida foi agrupada em instâncias para liberar orçamento de renderização; e o emblema da Central de Missões foi trazido para a face visível do marco. O avatar agora gira pelo menor arco e movimenta a cabeça a partir do pescoço, evitando giros completos e inclinação do corpo inteiro.

Na sexta evolução, a câmera passou a considerar também o marco em foco e a proporção da tela: ela enquadra o destino com deslocamento oposto e suaviza a direção sem saltos. Os beacons diferenciam marco ativo, pendente e visitado reaproveitando os mesmos meshes. A antiga cúpula fixa foi removida para revelar o céu dinâmico; sol, montanhas e silhuetas agora acompanham a jornada com parallax e duas camadas de profundidade. A luz ferruginosa perde intensidade enquanto a luz quente do jardim cresce.

Na sétima evolução, o Memorial 9 de Novembro tornou-se o primeiro asset GLB autoral do distrito. Concreto fraturado, lança diagonal, três trabalhadores em baixo-relevo, acento ferruginoso e espelho d'água substituem o marcador abstrato, mantendo um corpo procedural como fallback. A navegação assistida chega ao lado do monumento, e a câmera abre suavemente pelo corredor livre para que avatar e memória permaneçam legíveis juntos no mobile. O beacon foi elevado e ampliado ao redor da base sem deixar de comunicar os estados da interface.

Na oitava evolução, o boot passou a preservar uma única composição industrial entre o HTML inicial, a hidratação e o primeiro frame efetivamente pintado. Objetivo e controles permanecem inertes até a cena estar pronta; o modo leve continua acessível em um toque mesmo antes do JavaScript concluir. O viewport e o mundo estático foram memoizados, a telemetria deixou de provocar uma reconciliação React e o prefetch da landing foi retirado dessa etapa crítica. Falhas do chunk, renderer ou contexto WebGL agora conduzem ao modo leve sem apagar o progresso da jornada.

## Fantasia e loop

**Fantasia:** atravessar uma cidade ferida pelo modelo industrial e reconhecer caminhos coletivos de transformação.

**Loop:** caminhar → aproximar-se de uma marca → abrir memória, pauta ou missão → escolher um próximo passo → continuar explorando.

Não há pontuação, ranking, streak, progresso eleitoral, conteúdo bloqueado por doação ou contadores inventados.

## Avatar

O avatar de Alexandre é uma interpretação low-poly baseada nas referências fornecidas. Traços preservados:

- cabelo escuro, cheio e deslocado para o alto;
- barba escura completa;
- corpo alto e esguio;
- camiseta grafite e calça escura;
- colar com pingente;
- tatuagem vermelha no braço que executa o gesto de punho/saudação.

O modelo é construído com geometrias do Three.js, sem GLB ou textura fotográfica. Isso mantém o carregamento pequeno, permite animação procedural e evita depender de um asset facial pesado antes de validar a direção artística.

Além de caminhada e saudação, a versão procedural inclui respiração, movimento sutil de cabeça, piscar e reação facial durante a interação. A câmera começa em três quartos, abre progressivamente o campo para revelar o território e pode ser recentralizada sem modificar a simulação.

A caminhada agora mistura entrada e saída gradualmente, preserva uma fase própria e amortiza braços e pernas. Um pequeno emblema quente nas costas mantém a silhueta reconhecível quando a câmera acompanha o personagem de trás.

## Arquitetura

- `app/explorar`: metadados e entrada carregada apenas no cliente.
- `WorldExperience`: estado de interface, persistência, analytics, teclado e controles móveis.
- `WorldViewport`: boundary carregado sob demanda que contém apenas `Canvas` e `WorldScene`; o modo leve não solicita Three.js ou React Three Fiber.
- `worldSimulation`: posição, direção, limites, navegação assistida e proximidade dos marcos. Não depende do renderer.
- `WorldScene`: câmera, luz, cenário e composição React Three Fiber.
- `MemorialAsset`: carregamento isolado do GLB com `Suspense`, error boundary e fallback procedural; módulo e arquivo só são solicitados ao traçar rota para a memória ou chegar a menos de 5 m.
- `WorldBootShell`: composição leve e reutilizável que cobre HTML inicial, hidratação e primeiro frame sem percentuais artificiais.
- `WorldRuntimeBoundary`: recuperação de falhas do chunk ou renderer; perda de contexto WebGL é observada diretamente no Canvas.
- `InteractiveAlexandre`: representação visual e animações procedurais.
- `world.module.css`: HUD, joystick, painéis e modo leve.

O estado de alta frequência permanece em referências mutáveis e em `PlayerSimulation`; o React não é renderizado novamente a cada frame.

## Controles

- Mobile: joystick esquerdo e botão contextual direito.
- Desktop: WASD ou setas, Enter/Espaço para interagir, `C` para recentralizar e Escape para fechar o painel ativo antes de pausar.
- Assistido: botão “Ir até o próximo marco”.
- O botão contextual executa uma saudação quando não há um marco próximo e abre conteúdo quando há.

No desktop, o objetivo abre na orientação inicial e recolhe automaticamente; no mobile, começa compacto para preservar o campo de jogo. Quando um marco entra em alcance, ele reaparece brevemente apenas em telas maiores. O recolhimento automático não ocorre enquanto o foco estiver dentro do cartão.

O mapa apresenta zonas, caminho, marcos visitados e posição aproximada do jogador. Seus três marcadores são botões de 44 px com nome e estado visitado, compartilham a mesma ação de navegação da lista e funcionam por toque ou teclado. A lista detalhada permanece no desktop e é removida visualmente no mobile, onde os rótulos curtos acompanham os próprios marcadores.

O HUD também apresenta distância até o próximo marco, uma linha fina de progresso dos registros, instrução transitória de movimento e anúncios breves ao atravessar cada zona. No mobile, o cabeçalho mantém somente mapa e pausa, ambos com 44 px; modo leve e recentralização ficam concentrados na pausa. O botão de saudação encolhe fora de contexto e retorna ao tamanho de destaque perto de um marco.

O progresso superior passou a representar os três marcos registrados, com divisões visuais em terços, em vez da posição física no eixo do cenário. Rota iniciada, chegada, cancelamento e conclusão usam avisos breves na borda e uma única atualização em `aria-live`. Quando 3/3 é alcançado, o objetivo deixa de apontar falsamente para o primeiro marco e assume o estado “Travessia registrada”, com acesso para rever o mapa.

A orientação passou a considerar a rotação do personagem: uma bússola no objetivo aponta para o próximo marco, e a seta da instrução inicial acompanha a mesma direção. A trilha 0/3 mostra marcos visitados sem criar pontuação competitiva. O onboarding de movimento é lembrado localmente depois do primeiro uso e pode ser solicitado novamente no menu de pausa; quando solicitado, ele tem prioridade temporária sobre a dica de interação.

A navegação assistida agora expõe destino, estado ativo e ação de cancelamento. O toque manual no joystick continua assumindo o controle imediatamente. A pausa contém uma seção recolhível para qualidade visual e movimento reduzido; ambas as preferências são persistidas apenas no dispositivo. Conteúdos recolhidos usam `inert` para não deixar botões invisíveis alcançáveis pelo teclado.

Mapa, pausa e diário de campo são superfícies modais exclusivas. Ao abrir, o fundo fica `inert`, o foco entra no painel e permanece contido; Escape fecha a superfície também no modo leve e o foco retorna ao acionador. O joystick é alcançável por teclado e declara os atalhos direcionais. A preferência manual por movimento reduzido também controla as transições CSS, não apenas a animação 3D.

## Pontos narrativos

1. **Memória:** apresenta o Memorial 9 de Novembro, a greve de 1988, os três operários mortos e as fraturas preservadas após o atentado ao monumento. O painel aponta para a fonte oficial de patrimônio e turismo do município.
2. **Pauta:** apresenta a passagem do abandono ao comum.
3. **Missão:** leva ao seletor real da landing.

Cada conteúdo abre como um diário de campo com tipo, número do marco, progresso da travessia e ação para continuar ao próximo ponto. Links externos anunciam a abertura de nova aba e a seleção de missão expõe seu estado por `aria-pressed`.

O registro histórico inicial usa como fontes públicas a [Secretaria de Turismo de Volta Redonda](https://turismo.voltaredonda.rj.gov.br/cultura-patrimonio/) e o [Instituto Estadual de Engenharia e Arquitetura](https://www.rj.gov.br/ieea/node/132). Novos registros ainda precisam de curadoria, fonte e revisão editorial.

## Persistência e privacidade

Chave local: `missao-eluta:world-journey:v1`.

Somente são salvos:

- identificadores dos marcos visitados;
- modo 3D ou leve;
- data da atualização.

Nenhum nome, telefone, localização, bairro ou dado sensível é coletado.

## Fallback

`/explorar?modo=leve` apresenta a mesma jornada em HTML. Se WebGL não estiver disponível, o modo leve é selecionado automaticamente e o botão 3D fica indisponível. Painéis, textos e CTAs permanecem navegáveis por teclado e leitor de tela.

Se o runtime dinâmico falhar ou o navegador perder o contexto WebGL depois da entrada, a experiência migra para o modo leve, atualiza a URL e mantém os marcos registrados. Durante o boot, existe também uma saída HTML direta para o modo leve que não depende da conclusão do JavaScript.

## Orçamento inicial

- Three.js e React Three Fiber ficam fora do bundle inicial da homepage.
- Sem física, pós-processamento, sombras dinâmicas ou áudio; o único GLB local entra sob demanda no Memorial.
- DPR adaptativo: até 1.2 no perfil mobile equilibrado e 1.45 no desktop.
- Geometrias simples e materiais sem texturas.
- Meta: 30 FPS em celular intermediário e controles com pelo menos 44 × 44 px.

Na medição automatizada da sexta composição, a cena registrou 118 draw calls e 5.565 triângulos. O orçamento já inclui atmosfera, detalhes de solo, sombras falsas, luminárias, sinalização física, fumaça, água animada, rotor, bandeiras e vegetação instanciada, ainda sem texturas pesadas, sombras dinâmicas ou pós-processamento. O valor é exposto apenas como atributo de diagnóstico no contêiner da rota e deve ser revalidado quando novos assets forem adicionados.

Com o Memorial carregado e estabilizado, uma sessão mobile limpa registrou 119 draw calls e 6.625 triângulos. O GLB responde por 1.076 triângulos, três primitives, três materiais e 63.576 bytes; não usa texturas, compressão proprietária ou extensões obrigatórias. O glTF Validator não encontrou erros ou avisos, e uma reimportação headless no Blender confirmou três meshes e os anchors de interação e beacon. A especificação reproduzível está em `docs/assets/memorial-9-novembro-v1.md`.

O chunk que contém o loader e a URL do Memorial não aparece no HTML do modo leve. Assim, o novo asset continua sendo solicitado apenas quando a experiência 3D é ativada.

No Lighthouse mobile local desta rodada, `/explorar` registrou 69 em performance, 100 em acessibilidade, 100 em boas práticas e 100 em SEO, com FCP de 0,8 s, LCP de 1,8 s e CLS 0. O custo principal continua sendo a inicialização do runtime Three.js; a experiência 3D permanece carregada fora do bundle inicial da homepage.

Depois da separação de `WorldViewport`, o Lighthouse mobile do modo 3D registrou 70 em performance, 100 em acessibilidade, 100 em boas práticas e 100 em SEO, com FCP de 0,8 s, LCP de 1,9 s, TBT de 3,48 s e CLS 0. O modo leve registrou 96 em performance e TBT de 180 ms. A inspeção de recursos confirmou que seus 9 scripts não incluem nenhum dos 5 chunks Three/R3F, que passam a ser solicitados somente no modo 3D.

Na auditoria com o Memorial, três execuções Lighthouse mobile sob WebGL/SwiftShader variaram entre 48 e 65 em performance, mantendo 100 em acessibilidade, boas práticas e SEO. A rodada mediana registrou 52, FCP de 1,3 s, LCP de 4,5 s, TBT de 5,37 s e CLS 0. O GLB respondeu em 6–41 ms e transferiu cerca de 17 KB comprimidos; o custo dominante continuou sendo a avaliação do runtime Three/R3F sob CPU emulada. Por causa da alta variação do renderer headless, a regressão deve ser confirmada em aparelho físico antes de orientar redução visual. O relatório está em `reports/qa/lighthouse-memorial-v7.json`.

Depois das otimizações de boot, três novas rodadas ficaram entre 60 e 61 em performance, novamente com 100 em acessibilidade, boas práticas e SEO. A rodada mediana registrou FCP de 0,9 s, LCP de 3,8 s, TBT de 2,53 s e CLS de 0,001. Em relação à v7, o TBT caiu 52,8%, as requisições passaram de 21 para 18 e a transferência inicial caiu 10,7%. O GLB e o prefetch da landing deixaram de aparecer no boot; ambos entram somente por intenção ou navegação. O relatório está em `reports/qa/lighthouse-world-v8.json`.

Na nona evolução, o chão, a rota, as marcas, as montanhas, os prédios do horizonte e a arquitetura repetida das três zonas passaram a usar `InstancedMesh` por geometria e material. Armazéns, chaminés, pipe rack, mural, bancos, canteiros, pórtico, luminárias e coberturas solares mantêm as matrizes e cores anteriores, mas são enviados em lotes restritos à própria zona para limitar o aumento do volume de culling. Elementos com animação independente, como árvores e bandeiras, permaneceram separados.

No mesmo boot mobile de produção, em 390 × 844 e antes de solicitar o Memorial, a cena passou de 119 draw calls e 5.585 triângulos para 94 draw calls e 6.048 triângulos: redução de 21% nas chamadas com aumento de 8,3% nos triângulos processados, dentro da tolerância prevista para batches que reúnem objetos antes eliminados individualmente pelo frustum. A leitura ficou estável em recarregamentos consecutivos. Depois da rota e do carregamento do GLB, a sessão registrou 97 draw calls e 6.176 triângulos.

Três rodadas Lighthouse da v9 marcaram 57, 59 e 59 em performance, mantendo 100 em acessibilidade, boas práticas e SEO. A mediana registrou FCP de 0,91 s, LCP de 3,91 s, TBT de 3,10 s, Speed Index de 1,91 s e CLS de 0,001, com as mesmas 18 requisições do boot anterior. O renderer headless continuou variável — o TBT oscilou entre 1,82 s e 3,11 s —, por isso o ganho desta rodada é aceito pela telemetria direta da cena e pelo playtest visual, sem interpretar um ponto de diferença no score como tendência. Os relatórios estão em `reports/qa/lighthouse-world-v9-a.json`, `reports/qa/lighthouse-world-v9-b.json` e `reports/qa/lighthouse-world-v9-c.json`.

Na décima evolução, as três árvores e três bandeiras passaram para cinco `InstancedMesh` animados por um único controlador. Troncos ficam estáticos; copas, panos e losangos usam `DynamicDrawUsage`, preservam pivôs e fases originais e deixam de subir matrizes quando movimento reduzido está ativo. Esse conjunto caiu de 15 para 5 draw calls e de seis para um callback por frame. A animação ambiental de fumaça, rotor e reflexos também foi reunida em um callback, levando o runtime montado de 19 para 12 callbacks por frame.

O playtest identificou também que `vertexColors` estava sendo ativado em geometrias sem atributo de cor e multiplicava a cor por instância pelo valor padrão preto. A v10 usa apenas `instanceColor`, suportado diretamente pelo renderer, recuperando os verdes, ocres e acentos do chão, horizonte, placas, vegetação e bandeiras sem criar materiais adicionais.

A composição de chegada agora posiciona o avatar ao lado de cada marco. O Memorial mantém o ombro direito, o Comum recebe chegada pela esquerda e a Central de Missões pela direita; a câmera aplica um piso lateral contextual e um perfil próprio para paisagem. No mobile, objetivo e avisos transitórios não se sobrepõem, o prompt próximo fica associado ao botão Interagir e os controles ociosos usam menos fundo e blur sem reduzir suas áreas de toque.

No boot de 390 × 844, a leitura permaneceu em 94 draw calls e passou para 6.340 triângulos, pois o batch animado reúne todo o jardim quando parte dele entra no frustum. Em uma remontagem limpa já posicionada no jardim, a cena registrou 79 draw calls e 4.902 triângulos, alcançando o intervalo de 75–80 previsto para essa área. A matriz de QA cobriu 320 × 568, 360 × 800, 390 × 844, 412 × 823 e 844 × 390, sem overflow horizontal nem alvo interativo menor que 44 px.

As três rodadas Lighthouse da v10 marcaram 59 em performance e 100 em acessibilidade, boas práticas e SEO. A mediana registrou FCP de 0,91 s, LCP de 3,92 s, TBT de 3,07 s, Speed Index de 1,73 s e CLS de 0,001, mantendo 18 requisições. Em relação à mediana v9, FCP, LCP e TBT ficaram estáveis e o Speed Index melhorou cerca de 9,5%. Os relatórios estão em `reports/qa/lighthouse-world-v10-a.json`, `reports/qa/lighthouse-world-v10-b.json` e `reports/qa/lighthouse-world-v10-c.json`.

Na décima primeira evolução, os três beacons mantiveram seus seis meshes, materiais, raios e estados independentes, mas passaram de três callbacks para um controlador imperativo compartilhado. Essa decisão preserva opacidade, emissão, altura especial do Memorial e prioridade entre `active` e `visited`, evitando um shader customizado apenas para economizar quatro draws. O runtime passou de 12 para 10 callbacks por frame durante o boot.

O detector de proximidade do Memorial agora existe somente enquanto o asset está em `deferred`. Ao receber intenção ou entrar no raio de 5 m, ele muda a máquina de estados para `loading` e desmonta seu próprio `useFrame`; depois da ativação, o runtime fica em nove callbacks. O memorial procedural continua durante loading e fallback, enquanto o GLB substitui o corpo somente em `ready`. A inspeção de recursos confirmou GLB ausente no boot e um único asset observado após a rota; interação e diário permaneceram funcionais.

A separação visual entre zonas deixou de ser linear. Um `smoothstep` mantém a fábrica fria e com fog mais comprimido, conduz a virada cromática pelo corredor de transição e abre calor, luz e distância no jardim. A directional e as duas point lights existentes fazem o crossfade e foram reposicionadas como luzes laterais narrativas; nenhum objeto, luz ou draw call foi adicionado. Emissive mínimo nas roupas escuras melhora a silhueta do avatar sem alterar sua paleta.

O playtest visual passou nos três marcos, no modo leve, no retorno ao 3D e nos viewports 320 × 568, 390 × 844 e 844 × 390, sem overflow ou alvo menor que 44 px. O orçamento de draw calls permanece estruturalmente igual ao da v10, pois a evolução alterou apenas controle de movimento e parâmetros das luzes existentes.

As três rodadas Lighthouse finais da v11 marcaram 58, 59 e 59 em performance, mantendo 100 em acessibilidade, boas práticas e SEO. A mediana registrou FCP de 0,91 s, LCP de 3,91 s, TBT de 3,06 s, Speed Index de 1,82 s e CLS de 0,001, com as mesmas 18 requisições. FCP, LCP e TBT permaneceram equivalentes à v10; a variação de Speed Index ficou dentro da dispersão do renderer headless. Os relatórios estão em `reports/qa/lighthouse-world-v11-a.json`, `reports/qa/lighthouse-world-v11-b.json` e `reports/qa/lighthouse-world-v11-c.json`.

Na décima segunda evolução, cada marco recebeu uma assinatura espacial própria sem adicionar assets externos. O Memorial ganhou fissuras baixas, testemunhos inclinados e três fragmentos votivos; o Comum passou a ser reconhecido por um pórtico aberto e linhas convergentes de encontro; a Central de Missões recebeu uma moldura cívica e três sinais coloridos de ação. As 26 peças compartilham um lote estrutural de caixas e um lote simbólico de octaedros, com `instanceColor`, totalizando somente dois novos draw calls e cerca de 0,6 KB comprimido na transferência inicial.

No playtest de 390 × 844, os três destinos permaneceram legíveis durante aproximação, chegada, interação e continuidade do percurso, sem bloquear o avatar, o beacon ou o diário. Os viewports 320 × 568 e 844 × 390 não apresentaram overflow horizontal ou vertical e preservaram alvos interativos de pelo menos 44 px. A sessão no jardim registrou 97 draw calls e 6.632 triângulos; por reutilizar estado e enquadramento de uma jornada já avançada, esse número não deve ser comparado diretamente à remontagem limpa de 79 calls da v10. A diferença estrutural verificável da evolução é de dois lotes.

As três rodadas Lighthouse da v12 marcaram 57 em performance e 100 em acessibilidade, boas práticas e SEO, com 18 requisições e 386,3 KB. A mediana registrou FCP de 0,91 s, LCP de 3,98 s, TBT de 4,32 s, Speed Index de 2,68 s e CLS de 0,001. A máquina apresentou benchmark Lighthouse entre 2.588 e 2.832, abaixo dos 3.267–3.367 da v11; portanto, o TBT não é tratado como regressão atribuível aos dois lotes sem repetição no mesmo perfil físico. Os relatórios preservam essa variação em `reports/qa/lighthouse-world-v12-a.json`, `reports/qa/lighthouse-world-v12-b.json` e `reports/qa/lighthouse-world-v12-c.json`. O aceite de 30 FPS e estabilidade térmica continua dependendo de profiling em celular intermediário real.

## Expansão segura

Depois de validar o vertical slice:

1. substituir o avatar procedural por GLB rigado mantendo a mesma API de simulação;
2. adicionar animações `idle`, `walk`, `interact` e `fist` em clips;
3. criar Arquivo Abandonado, Praça da Escuta, Jardim do Comum e Central de Missões completos;
4. adotar GLB/glTF, LOD, Meshopt/Draco e texturas KTX2 somente quando houver assets definitivos;
5. realizar curadoria histórica e revisão jurídica antes de publicar conteúdo factual.

## Riscos atuais

- A semelhança é estilizada, não biométrica ou hiper-realista.
- O aviso de depreciação de `THREE.Clock` vem da versão atual do renderer e não impede o funcionamento.
- Performance final ainda deve ser medida em aparelhos físicos; emulação de viewport não substitui GPU móvel real.
- Os textos de memória e pauta são protótipos editoriais, não arquivo histórico concluído.
