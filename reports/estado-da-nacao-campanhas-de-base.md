# Estado da Nacao - Laboratorio de Campanhas de Base

Projeto: Landing Missao
Data: 2026-05-04
Escopo: modulo de estudo e aplicacao para pre-campanha de base, sem mudancas de backend/banco.

---

## 1) DIAG executado antes de alterar

Mapeamento de estrutura e rotas no workspace:

- Rotas existentes antes deste modulo:
  - / (app/page.tsx -> redirect)
  - /lancamento (app/lancamento/page.tsx)

- Rotas relacionadas pedidas no diagnostico:
  - formacao: inexistente antes
  - debates: inexistente
  - voluntario: inexistente nesta codebase (referenciado via next em URL)
  - missoes: inexistente nesta codebase (referenciado via next em URL)
  - territorio: inexistente
  - convites: inexistente
  - admin: inexistente
  - origem/referral: nao ha rota dedicada; fluxo de ref ocorre via querystring em /lancamento

Conclusao do DIAG:
- Sem conflito de rotas no App Router.
- Sem necessidade de migracao de backend.
- Sem alteracao de banco de dados neste primeiro tijolo.

---

## 2) Arquivos criados/editados

Criados:
- src/content/campanhasDeBase.ts
- src/components/campanhas/CampanhasDeBaseModule.tsx
- app/metodo/page.tsx
- app/formacao/campanhas-de-base/page.tsx
- reports/estado-da-nacao-campanhas-de-base.md

Editados:
- nenhum arquivo de backend/banco

---

## 3) Rotas criadas

- /metodo
  - pagina publica/metodologica

- /formacao/campanhas-de-base
  - pagina interna de formacao (primeiro tijolo do modulo)

Estado de build:
- Rotas compiladas e geradas sem erro em npm run verify.

---

## 4) Conteudo central do modulo

Fonte unica:
- src/content/campanhasDeBase.ts

Cards de referencia incluidos:
- Barcelona en Comu
- Decidim
- CUP
- Orcamento Participativo de Porto Alegre
- Zapatismo civil / Outra Campanha
- Bernie Sanders
- Momentum
- La France Insoumise

Campos por card:
- nome
- pais
- afinidade ideologica
- o que deu certo
- risco/limite
- o que adaptar para o Missao ELuta
- cuidado juridico no Brasil

Tabela aplicada:
- O que copiar / O que evitar / Como implementar

CTAs aplicados:
- Entrar no app
- Ver missoes
- Participar de debate
- Chamar mais pessoas

---

## 5) Riscos eleitorais evitados

Checklist de linguagem e conformidade:
- Sem pedido explicito de voto
- Sem numero eleitoral
- Sem uso de "eleja"
- Sem promessa de beneficio individual
- Sem ataque a honra de adversarios
- Sem simulacao de propaganda oficial de campanha
- Linguagem centrada em:
  - pre-campanha
  - organizacao popular
  - formacao
  - escuta
  - territorio
  - missao
  - participacao

Aviso juridico incluido nas paginas:
- "Este material e de formacao politica e organizacao de pre-campanha, respeitando a legislacao eleitoral brasileira."

---

## 6) Verificacao tecnica

Comando executado:
- npm run verify

Resultado:
- typecheck: OK
- lint: OK
- build: OK

Rotas no build:
- /metodo (static)
- /formacao/campanhas-de-base (static)
- /lancamento (dynamic)

---

## 7) Proximos modulos sugeridos

1. Modulo "Escuta e Territorio"
- formulario de escuta por bairro
- trilha de devolutiva por prioridade

2. Modulo "Debates de Base"
- roteiro de facilitação
- sintese semanal por tema

3. Modulo "Missoes"
- biblioteca de missoes por nivel de entrada
- metas de 7 dias para voluntariado

4. Modulo "Convites e origem"
- quadro de origem por canal
- ciclo de convite "chamar mais 3" com feedback

5. Modulo "Formacao juridica"
- guardrails de pre-campanha em linguagem simples
- exemplos de copy permitida e copy de risco
