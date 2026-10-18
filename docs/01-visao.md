# 01 — Visão e escopo

- **Status:** Rascunho
- **Versão:** 0.6
- **Última atualização:** 18-10-2026

## 1. Problema

Dificuldade em gerenciar finanças pessoais de forma unificada e preditiva. As
soluções comerciais atuais costumam ser poluídas com funcionalidades excessivas
ou rígidas demais para acompanhar o ciclo real das contas (planejado vs.
realizado, variações entre [Valor Previsto](00-glossario.md#valor-previsto) e
[Valor Realizado](00-glossario.md#valor-realizado), divergência de datas de
pagamento/recebimento e [Transferência](00-glossario.md#transferência) entre
contas).

Além disso, há contas que vencem **antes** da próxima receita entrar. Para
pagá-las, o dinheiro precisa ser separado no mês anterior, mas as ferramentas
tratam a despesa apenas no mês do vencimento, o que distorce o planejamento
mensal e anual.

## 2. Objetivo

Desenvolver um sistema de gestão financeira pessoal leve e focado em
previsibilidade, que permita registrar [Lançamento](00-glossario.md#lançamento)s
([Receita](00-glossario.md#receita)s e [Despesa](00-glossario.md#despesa)s,
previstos ou realizados), visualizar métricas diárias, mensais e anuais,
projetar o saldo e acompanhar a [Variação](00-glossario.md#variação) entre o
previsto e o realizado, incluindo a
[Reserva](00-glossario.md#reserva-competência-antecipada) de lançamentos em um
[Mês de Competência](00-glossario.md#mês-de-competência) anterior ao vencimento.

## 3. Objetivos do projeto como portfólio

O projeto serve também para praticar e demonstrar atividades de análise e
desenvolvimento de sistemas:

- **Especificação:** requisitos, regras de negócio e critérios de aceite, em
  documentos enxutos e consistentes entre si.

- **Modelagem:** domínio e dados, partindo de uma linguagem ubíqua compartilhada
  entre documentos, código e banco.

- **Arquitetura e decisões:** monorepo com NestJS e Vue, persistência com
  Drizzle e PostgreSQL, e decisões de arquitetura registradas em ADRs.

- **Implementação:** fatias verticais ponta a ponta (Vue, NestJS e Drizzle), com
  testes sobre as regras de negócio.

## 4. Stakeholders e usuários

| Papel                                                   | Descrição                                                    | Interesse                                                                                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Usuário Padrão](00-glossario.md#usuário-padrão) (Dono) | Pessoa física que gerencia as próprias finanças              | Ter clareza sobre o [Saldo Atual](00-glossario.md#saldo-atual) vs. [Saldo Projetado](00-glossario.md#saldo-projetado) e controle preciso do histórico financeiro |
| Avaliador / Recrutador                                  | Desenvolvedor ou gestor de engenharia analisando o portfólio | Avaliar a maturidade arquitetural, qualidade de código e organização da documentação                                                                             |

## 5. Escopo

### Dentro do escopo (MVP)

- **Gestão de Lançamentos:**
  - Registro de receitas e despesas, previstas ou realizadas, classificadas por
    [Categoria](00-glossario.md#categoria).

  - [Parcelamento](00-glossario.md#parcelamento): geração automática das
    [Parcela](00-glossario.md#parcela)s mensais de uma operação.

  - Acompanhamento da [Variação](00-glossario.md#variação) entre previsto e
    realizado:

    - **Data:** [Data Prevista](00-glossario.md#data-prevista) vs.
      [Data Realizada](00-glossario.md#data-realizada) (adiantamento ou atraso).

    - **Valor:** [Valor Previsto](00-glossario.md#valor-previsto) vs.
      [Valor Realizado](00-glossario.md#valor-realizado).

  - **[Reserva](00-glossario.md#reserva-competência-antecipada):** um lançamento
    pode ter [Mês de Competência](00-glossario.md#mês-de-competência) anterior
    ao mês do vencimento. Ele passa a contar nas visões mensal e anual do mês e
    ano da Reserva.

  - **Correção por [Estorno](00-glossario.md#estorno):** lançamentos realizados
    não têm valores nem datas editados e não podem ser cancelados; erros se
    corrigem por estorno, que preserva o histórico.

- **Gestão de Contas, Categorias e Transferências:**
  - [Conta](00-glossario.md#conta)s, cada uma com
    [Saldo Inicial](00-glossario.md#saldo-inicial) e
    [Data de Início](00-glossario.md#data-de-início) do rastreamento.

  - Categorias de receita e de despesa.

  - [Transferência](00-glossario.md#transferência) de dinheiro entre contas.

- **Métricas e Projeções:**
  - **[Visão Diária](00-glossario.md#visão-diária-mensal-e-anual):** o que
    realmente aconteceu até [Hoje](00-glossario.md#hoje) e, daí em diante, o
    previsto na [Data Prevista](00-glossario.md#data-prevista).

  - **Visões mensal e anual:** o que pertence a cada período, incluindo as
    reservas.

  - Projeção de [Saldo Projetado](00-glossario.md#saldo-projetado) com base nos
    lançamentos previstos.

  - Indicadores visuais de variação, do
    [Estado do Lançamento](00-glossario.md#estado-do-lançamento) e de quais
    estão [Vencido (Derivado)](00-glossario.md#vencido-derivado).

### Depois do MVP

- Importação e exportação de lançamentos em CSV.

- [Ajuste para Dia Útil](00-glossario.md#ajuste-para-dia-útil) automático das
  datas das parcelas para [Dia Útil](00-glossario.md#dia-útil).

### Fora do escopo (neste ciclo)

- Autenticação e múltiplos usuários (o modelo já prevê `user_id`; no MVP existe
  apenas o [Usuário Padrão](00-glossario.md#usuário-padrão)).
- Importação automática via Open Finance / OFX / extratos bancários.
- Gestão e cotação de ativos de investimentos em tempo real.
- Notificações por e-mail ou push.
- Bloqueio diário do saldo a partir da reserva (saldo disponível dia a dia).
- Lançamentos recorrentes (ex.: conta de água todo mês).

## 6. Premissas e restrições

| Tipo      | Descrição                                                                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Premissa  | O uso inicial será estritamente pessoal (Single-User), rodando em ambiente controlado                                                                                                      |
| Premissa  | A modelagem do banco de dados deve prever uma futura migração para suporte a múltiplos usuários sem refatoração destrutiva                                                                 |
| Premissa  | A [Reserva (Competência Antecipada)](00-glossario.md#reserva-competência-antecipada) é uma atribuição de competência: não movimenta dinheiro nem altera o saldo em caixa ou a visão diária |
| Premissa  | Todos os valores são em reais (BRL), com uma única moeda                                                                                                                                   |
| Restrição | **Stack:** Frontend em Vue.js (com Tailwind CSS), Backend em NestJS, ORM com Drizzle e banco de dados PostgreSQL                                                                           |

## 7. Riscos

| Risco                                                                                                                                                          | Probabilidade | Impacto | Mitigação                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escopo crescer além do MVP                                                                                                                                     | Média         | Alto    | Manter a lista "Fora do escopo" estrita e priorizar regras de negócio essenciais.                                                                                         |
| Complexidade na projeção e recálculo de parcelas                                                                                                               | Média         | Médio   | Modelar explicitamente o ciclo de vida do lançamento desde a camada do banco de dados.                                                                                    |
| Dois eixos de tempo ([Eixo de Caixa](00-glossario.md#eixo-de-caixa) e [Eixo de Competência](00-glossario.md#eixo-de-competência)) gerarem leituras divergentes | Média         | Médio   | Documentar a diferença, nomear os eixos nas telas ("Caixa" e "Competência") e cobrir com testes os casos em que pagamento e competência caem em meses ou anos diferentes. |
| Documentação excessiva                                                                                                                                         | Média         | Médio   | Documentos mínimos; criar os demais sob demanda, junto de cada fatia de código.                                                                                           |

## 8. Critérios de sucesso

- Conseguir visualizar o [Saldo Projetado](00-glossario.md#saldo-projetado) do
  mês atual considerando contas ainda não pagas.

- Identificar com facilidade o histórico de atrasos, adiantamentos e
  [Variação](00-glossario.md#variação)s entre o valor planejado e o pago nas
  parcelas/contas passadas.

- Registrar um novo [Lançamento](00-glossario.md#lançamento) ou
  [Transferência](00-glossario.md#transferência) em menos de 1 minuto.

- Ver, no [Resultado](00-glossario.md#resultado) do mês anterior, as contas que
  vencem no início do mês seguinte já consideradas como
  [Reserva](00-glossario.md#reserva-competência-antecipada).

- Repositório de demonstração contendo ADRs claras e histórico rastreável de
  decisões arquiteturais.
