# Memorial 9 de Novembro — piloto GLB v1

Interpretação low-poly produzida para o primeiro marco de memória do mundo 3D. O asset não é uma reprodução documental: preserva a ideia de concreto fraturado, lança diagonal, três trabalhadores em baixo-relevo e acento ferruginoso, enquanto o contexto histórico completo permanece no diário em HTML.

## Contrato técnico

- Arquivo de entrega: `public/world/memorial-9-novembro-v1.glb`.
- Fonte reproduzível: `scripts/blender/build_memorial_glb.py`.
- Unidade: metro; eixo vertical `+Y` no glTF.
- Pivot: centro da base no chão.
- Frente narrativa: `+Z` no glTF.
- Bounding box: `2,10 × 2,51 × 1,22 m`.
- Geometria: 1.076 triângulos, três meshes e três primitives.
- Materiais: `MAT_Concrete`, `MAT_Oxide` e `MAT_Brass`.
- Tamanho entregue: 63.576 bytes.
- Sem texturas, animações, câmera, luz, rig ou extensão obrigatória.
- Materiais opacos e single-sided.

Hierarquia estável:

```text
Memorial_9_Novembro
├─ Memorial_Structure
├─ Memorial_Fracture_And_Rebar
├─ Memorial_Plaque_Three_Workers
├─ ANCHOR_Interaction
└─ ANCHOR_Beacon
```

`ANCHOR_Beacon` fica a 2,65 m. O beacon continua procedural porque seus estados ativo, pendente e visitado pertencem à interface da jornada, não ao asset histórico.

## Orçamento e decisões

O piloto fica abaixo do teto de 1.200 triângulos, quatro draw calls e 160 KB definido para o LOD próximo. Como existe uma única instância, o arquivo tem 64 KB e a simulação ainda não usa física, não há LOD ou proxy de colisão nesta versão. A proximidade e o alcance de interação continuam sob responsabilidade de `worldSimulation`, sem depender da malha renderizada.

Um corpo procedural simples permanece como fallback de carregamento e erro. O espelho d'água é renderizado na cena para que possa compartilhar o comportamento visual do território e ser ajustado sem reexportar o GLB.

Para proteger o boot mobile, o módulo do loader e o GLB não são solicitados na entrada do distrito. O corpo procedural permanece visível até a pessoa traçar uma rota para o Memorial ou chegar a menos de 5 m; depois que o arquivo fica pronto, a troca ocorre sem remover beacon, água ou interação.

## Pipeline reproduzível

```powershell
& "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" `
  --background --factory-startup `
  --python scripts\blender\build_memorial_glb.py `
  -- --output "$env:TEMP\memorial-9-novembro-v1.raw.glb"

npx --yes @gltf-transform/cli dedup `
  "$env:TEMP\memorial-9-novembro-v1.raw.glb" `
  "$env:TEMP\memorial-9-novembro-v1.dedup.glb"

npx --yes @gltf-transform/cli weld `
  "$env:TEMP\memorial-9-novembro-v1.dedup.glb" `
  public\world\memorial-9-novembro-v1.glb

npx --yes @gltf-transform/cli inspect public\world\memorial-9-novembro-v1.glb
npx --yes @gltf-transform/cli validate public\world\memorial-9-novembro-v1.glb
```

Resultado de validação: nenhum erro e nenhum aviso. Os dois registros informativos de nó vazio são intencionais e correspondem aos anchors. Uma reimportação headless no Blender confirmou três meshes e a preservação dos dois anchors.

## Origem e licença

Asset autoral gerado pelo script do projeto. Não incorpora modelos, imagens ou texturas de terceiros. Qualquer evolução em direção a uma reprodução documental deve passar por curadoria histórica e validação de direitos antes de publicação.
