# 00 — Glossário e Linguagem Ubíqua

- **Status:** Rascunho
- **Versão:** 0.1
- **Última atualização:** 10-10-2026

Este documento estabelece a Linguagem Ubíqua do sistema, definindo os termos
financeiros e técnicos utilizados tanto nas regras de negócio quanto na
modelagem do banco de dados e na interface com o usuário. Termos em `código`
são os nomes usados nos documentos e no banco.

---

## 1. Conceitos Financeiros e Regras de Tempo

### Hoje

Data atual do sistema (dia civil).

### Data de Consulta (D)

Data para a qual se consulta o saldo ou a projeção. Não é armazenada: é o
parâmetro da consulta.

### Eixo de Caixa

Dimensão temporal que considera o momento em que o dinheiro realmente se move:
`data_realizada` para lançamentos realizados e `data_prevista` para os
previstos. É o eixo da visão diária.

### Eixo de Competência

Dimensão temporal que atribui o lançamento ao período (mês/ano) ao qual ele
pertence financeiramente, independentemente de quando o dinheiro sai da conta.
É o eixo das visões mensal e anual.

### Mês de Competência

Mês ao qual um lançamento pertence para fins de planejamento
(`mes_competencia`). É sempre o primeiro dia de um mês e, por padrão, é o mês do
vencimento. Nunca é posterior ao vencimento.

### Reserva (Competência Antecipada)

Lançamento, de receita ou despesa, cujo mês de competência é anterior ao mês do
seu vencimento. Usada para contas que vencem no início do mês e precisam ser
separadas no planejamento do mês anterior. Não move dinheiro e não altera o
caixa nem a visão diária.

### Visão Diária, Mensal e Anual

A **diária** mostra o que acontece dia a dia, pelo eixo de caixa. A **mensal** e
a **anual** mostram o que pertence ao período, pelo eixo de competência,
incluindo as reservas.

### Saldo Atual

Dinheiro que de fato está na conta hoje. Considera apenas o que já aconteceu;
lançamentos previstos não entram.

### Saldo Projetado

Estimativa do saldo da conta na data de consulta D, considerando também os
lançamentos previstos até essa data. Previstos vencidos continuam na sua data.

### Saldo Acumulado

Saldo inicial somado ao resultado de cada mês (ou ano), em sequência, pelo eixo
de competência. Existe a versão **confirmada** (só realizados) e a **projetada**
(realizados e previstos).

### Resultado

Receitas menos despesas de um período. Transferências e saldo inicial não fazem
parte do resultado.

### Data Nominal

Data mensal calculada pelo parcelamento para uma parcela, antes de qualquer
ajuste para dia útil.

### Dia Útil

Qualquer dia que não seja sábado, domingo ou feriado nacional.

### Ajuste para Dia Útil

Postergação da `data_prevista` de uma parcela para o primeiro dia útil seguinte,
quando a data nominal não é um dia útil.

---

## 2. Entidades e Estados do Sistema

### Lançamento

Registro individual de uma movimentação financeira, que pode ser uma
**Receita** (+) ou uma **Despesa** (−). É a unidade central do sistema.

### Receita

Entrada de dinheiro.

### Despesa

Saída de dinheiro.

### Estado do Lançamento

Ciclo de vida de um lançamento:

- **Previsto (P):** agendado ou planejado; possui `data_prevista` e
  `valor_previsto`, mas ainda não movimentou o caixa.
- **Realizado (C):** confirmado ou quitado; possui `data_realizada` e
  `valor_realizado`.
- **Cancelado (X):** retirado do fluxo financeiro, mantido apenas para histórico.

### Previsto e Realizado (campos)

- `data_prevista`: data planejada, o vencimento.
- `valor_previsto`: valor planejado.
- `data_realizada`: data em que o pagamento ou recebimento de fato ocorreu.
- `valor_realizado`: valor efetivamente pago ou recebido.

### Confirmar

Passar um lançamento de Previsto para Realizado, informando a data e o valor
reais.

### Vencido (Status Derivado)

Condição de um lançamento Previsto cuja `data_prevista` é anterior a "Hoje". Não
é salvo no banco de dados: é calculado em tempo de execução.

### Variação

Divergência entre o planejado e o executado:

- **Variação de Data:** diferença em dias entre `data_realizada` e
  `data_prevista`. Positiva indica atraso, negativa indica adiantamento e zero
  indica pagamento em dia.
- **Variação de Valor:** diferença entre `valor_previsto` e `valor_realizado`,
  positiva quando favorece o usuário (despesa paga a menos ou receita recebida a
  mais). Também expressa em percentual do valor previsto.

### Estorno

Correção de um lançamento Realizado. Cria um lançamento espelho, vinculado ao
original, com o mesmo valor, conta, tipo e categoria, e efeito invertido. O
original permanece intacto.

### Categoria

Classificação de um lançamento (ex.: Moradia, Salário). Tem tipo de receita ou de
despesa.

### Inativar

Impedir o uso futuro de uma conta ou categoria sem apagar o histórico.

---

## 3. Estruturas Financeiras

### Conta

Entidade que representa uma fonte financeira real (ex.: conta corrente, carteira,
reserva de emergência). Possui um saldo inicial e uma data de início.

### Saldo Inicial

Quanto a conta tinha quando o rastreamento começou (`saldo_inicial`). É o ponto
de partida dos saldos e não é receita nem despesa.

### Data de Início

Dia a partir do qual a conta é rastreada (`data_inicio`).

### Transferência

Movimentação de saldo entre duas contas do próprio usuário. Não é receita nem
despesa: afeta apenas a distribuição do dinheiro entre as contas envolvidas.

### Parcelamento

Divisão de uma operação financeira em N parcelas mensais vinculadas, geradas
automaticamente.

### Parcela

Lançamento gerado por um parcelamento, numerado de 1 a N, com valores e datas
próprios.

---

## 4. Sistema

### Usuário Padrão

Único usuário do MVP. As entidades de negócio têm `user_id` para permitir
múltiplos usuários no futuro.

### Importação e Exportação CSV

Entrada e saída de lançamentos em arquivo CSV.

---

## 5. Siglas dos documentos

| Sigla    | Significado                                   |
| -------- | --------------------------------------------- |
| RF / RNF | Requisito funcional / requisito não funcional |
| RN       | Regra de negócio                              |
| UC       | Caso de uso                                   |
| TL       | Tela                                          |
| ADR      | Registro de decisão de arquitetura            |
| MoSCoW   | Prioridade: Must, Should, Could, Won't        |
