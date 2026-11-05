# Visão

- **Status:** Pronto
- **Versão:** 1.0
- **Última atualização:** 05-11-2026

Este documento explica **por que** o sistema existe e **onde ele para**. O que o
sistema faz, em detalhe, está em [requisitos](requisitos.md). Os termos estão no
[glossário](glossario.md).

## Problema

Gerenciar finanças pessoais de forma unificada e preditiva é difícil. Os apps
comerciais costumam ser poluídos de funcionalidades ou rígidos demais para
acompanhar o ciclo real do dinheiro: o que se planeja raramente acontece
exatamente como planejado (o valor muda, o pagamento atrasa ou adianta), e o
dinheiro circula entre várias contas.

Há também um problema de planejamento: algumas despesas vencem **antes** da
próxima receita entrar. Para pagá-las, o dinheiro precisa ser separado no mês
anterior, mas as ferramentas só enxergam a despesa no mês do vencimento. Isso
distorce o planejamento mensal e anual.

## Objetivo

Um sistema de finanças pessoais leve e focado em **previsibilidade**: registrar
o que se planeja e o que de fato acontece, comparar os dois, projetar o saldo e
planejar cada mês e ano de acordo com a lógica do orçamento, inclusive
reservando em um mês o que só vence no seguinte.

## Objetivo como portfólio

O projeto também serve para praticar e demonstrar análise e desenvolvimento de
sistemas:

- documentação enxuta e consistente entre si;
- decisões de arquitetura registradas em ADRs;
- implementação em fatias (tela, API e banco), com testes sobre as regras de
  negócio.

## Usuários

- **Usuário final:** uma pessoa gerenciando as próprias finanças. Uso pessoal,
  um único usuário.
- **Avaliador do portfólio:** quem lê a documentação e o código para avaliar a
  organização e a qualidade do projeto.

## Escopo

### Dentro do escopo (MVP)

O MVP cobre quatro áreas. O detalhe de cada uma está nos requisitos.

- **Contas e categorias:** organizar de onde o dinheiro sai e para onde vai.
- **Lançamentos:** registrar o planejado e o realizado, acompanhar a diferença
  entre os dois e corrigir erros sem perder o histórico.
- **Parcelamentos e transferências:** operações que envolvem várias parcelas ou
  várias contas.
- **Visões e saldos:** ver o dinheiro dia a dia, por mês e por ano, e projetar o
  saldo para uma data futura.

### Fora do escopo

Não serão feitos neste projeto, ou não neste ciclo.

- **Autenticação e múltiplos usuários:** o MVP tem um usuário só. O modelo de
  dados já é preparado para crescer, mas não há login.
- **Importação automática de extratos** (Open Finance, OFX): exige integrações
  externas que não agregam ao objetivo do projeto.
- **Gestão e cotação de investimentos:** uma conta de investimentos é só mais
  uma conta; o sistema não acompanha a rentabilidade.
- **Notificações** por e-mail ou push.
- **Lançamentos recorrentes** (ex.: conta de água todo mês): cada lançamento é
  criado individualmente.
- **Saldo disponível dia a dia descontando as reservas:** a reserva só afeta as
  visões mensal e anual, nunca o saldo em caixa.

### Depois do MVP

Funcionalidades já pensadas, mas adiadas. Cada uma vira requisito quando entrar
no escopo. As regras já decididas para elas estão em [regras](regras.md).

- **Importação e exportação de lançamentos em CSV.**
    - _Exportar:_ baixar em CSV os lançamentos que estão filtrados na listagem.
    - _Importar:_ criar lançamentos em lote a partir de um CSV estruturado, para
      migrar o histórico de planilhas ou de outros apps.
    - _Por que depois:_ o sistema funciona sem isso; só compensa quando houver
      histórico grande para migrar.

- **Ajuste para dia útil nas parcelas.**
    - _Hoje:_ as parcelas de um parcelamento caem sempre no mesmo dia do mês,
      mesmo que seja sábado, domingo ou feriado.
    - _Depois:_ a data prevista da parcela passaria para o primeiro dia útil
      seguinte, e o usuário ainda poderia alterá-la manualmente.
    - _Por que depois:_ exige uma lista de feriados nacionais, e o ajuste manual
      resolve o caso enquanto isso.

## Premissas e restrições

- Uso estritamente pessoal, com um único usuário, em ambiente controlado.
- O modelo de dados deve permitir múltiplos usuários no futuro sem refatoração
  destrutiva.
- Todos os valores são em reais (BRL), com uma única moeda.
- Stack: Vue com Tailwind CSS no frontend, NestJS no backend, Drizzle como ORM e
  PostgreSQL como banco. As decisões estão em [adr](adr/).
