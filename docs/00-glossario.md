# 00 — Glossário e Linguagem Ubíqua

- **Status:** Revisado
- **Versão:** 0.3
- **Última atualização:** 13-10-2026

Este documento estabelece a Linguagem Ubíqua do sistema: o vocabulário comum dos
documentos, do código e do banco. Os documentos usam termos em português; o
código e o banco usam inglês. Cada termo traz a linha **Em código** com o nome
correspondente, no formato do schema do banco (snake_case).

Uma definição diz o que o termo é e o que ele não é. Como calcular e o que é
proibido são regras de negócio, e ficam nas regras.

---

## 1. Conceitos Financeiros e Regras de Tempo

### Hoje

Data atual do sistema (dia civil).

**Em código:** `today`, calculada pela aplicação.

### Data de Consulta ($D$)

Data para a qual se consulta o saldo ou a projeção. Não é armazenada: é o
parâmetro da consulta.

**Em código:** `as_of`.

### Eixo de Caixa

Dimensão temporal que considera o momento em que o dinheiro realmente se move: a
Data Realizada, para lançamentos realizados, e a Data Prevista, para os
previstos. É o eixo da visão diária.

**Em código:** `cash` (usa `transaction_date` e `due_date`).

### Eixo de Competência

Dimensão temporal que atribui o lançamento ao período (mês/ano) ao qual ele
pertence financeiramente, independentemente de quando o dinheiro sai da conta.
É o eixo das visões mensal e anual.

**Em código:** `accrual` (usa `accounting_month`).

### Mês de Competência

Mês ao qual um lançamento pertence para fins de planejamento.

**Em código:** `accounting_month`.

### Reserva (Competência Antecipada)

Lançamento, de receita ou despesa, cujo Mês de Competência é anterior ao mês da
sua Data Prevista. Usada para contas que precisam ser separadas no planejamento
do mês anterior. Não move dinheiro e não altera o caixa nem a visão diária.

**Em código:** derivada, quando `accounting_month` é anterior ao mês de
`due_date`.

### Visão Diária, Mensal e Anual

A **diária** mostra o que acontece dia a dia, pelo Eixo de Caixa. A **mensal** e
a **anual** mostram o que pertence ao período, pelo Eixo de Competência,
incluindo as reservas.

**Em código:** `daily`, `monthly` e `yearly`, agregações calculadas.

### Saldo Atual

Dinheiro que de fato está na conta hoje. Considera apenas o que já aconteceu;
lançamentos previstos não entram.

**Em código:** `current_balance`, calculado.

### Saldo Projetado

Estimativa do saldo da conta na Data de Consulta, considerando também os
lançamentos previstos até essa data.

**Em código:** `projected_balance`, calculado.

### Saldo Acumulado

Saldo Inicial somado ao Resultado de cada mês (ou ano), em sequência, pelo Eixo
de Competência. Existe a versão **confirmada** (só realizados) e a **projetada**
(realizados e previstos).

**Em código:** `cumulative_balance`, calculado.

### Resultado

Receitas menos despesas de um período. Não inclui transferências nem o Saldo
Inicial.

**Em código:** `result`, calculado.

### Data Nominal

Data mensal calculada pelo Parcelamento para uma parcela, antes de qualquer
Ajuste para Dia Útil.

**Em código:** `nominal_date`, calculada na geração das parcelas e não
armazenada.

### Dia Útil

Qualquer dia que não seja sábado, domingo ou feriado nacional.

**Em código:** `business_day`.

### Ajuste para Dia Útil

Postergação da Data Prevista de uma parcela para o primeiro Dia Útil seguinte,
quando a Data Nominal não é um Dia Útil.

**Em código:** `business_day_adjustment`.

---

## 2. Entidades e Estados do Sistema

### Lançamento

Registro individual de uma receita ou despesa, prevista ou realizada. É a
unidade central do sistema. Transferências não são lançamentos.

**Em código:** tabela `transactions`.

### Receita

Entrada de dinheiro.

**Em código:** `type = 'I'` (Income).

### Despesa

Saída de dinheiro.

**Em código:** `type = 'E'` (Expense).

### Estado do Lançamento

Ciclo de vida de um lançamento:

- **Previsto (P):** planejado, ainda não aconteceu.
- **Realizado (C):** confirmado, já aconteceu.
- **Cancelado (X):** retirado do fluxo financeiro, mantido apenas para histórico.

**Em código:** `status`, com `P` (Pending), `C` (Confirmed) e `X` (Canceled).

### Data Prevista

Data planejada para o pagamento ou recebimento; o vencimento.

**Em código:** `due_date`.

### Valor Previsto

Valor planejado.

**Em código:** `amount`.

### Data Realizada

Data em que o pagamento ou recebimento de fato ocorreu. Só existe em lançamentos
realizados.

**Em código:** `transaction_date`.

### Valor Realizado

Valor efetivamente pago ou recebido. Só existe em lançamentos realizados.

**Em código:** `paid_amount`.

### Confirmar

Passar um lançamento de Previsto para Realizado, informando a Data Realizada e o
Valor Realizado.

**Em código:** transição de `status` de `P` para `C`.

### Vencido (Derivado)

Condição de um lançamento Previsto cuja Data Prevista é anterior a Hoje. Não é
salvo no banco de dados: é calculado em tempo de execução.

**Em código:** `overdue`, calculado.

### Variação

Divergência entre o planejado e o executado:

- **Variação de Data:** diferença em dias entre a Data Realizada e a Data
  Prevista. Positiva indica atraso, negativa indica adiantamento e zero indica
  pagamento em dia.

- **Variação de Valor:** diferença entre o Valor Previsto e o Valor Realizado,
  positiva quando favorece o usuário (despesa paga a menos ou receita recebida a
  mais). Também expressa em percentual do Valor Previsto.

**Em código:** `date_variation` e `value_variation`, calculadas.

### Estorno

Correção de um lançamento Realizado por meio de um novo lançamento vinculado ao
original, com efeito invertido. O original permanece intacto.

**Em código:** `reversal_of_id`, que aponta para o lançamento original.

### Categoria

Classificação de um lançamento (ex.: Moradia, Salário). Tem tipo de receita ou
de despesa.

**Em código:** tabela `categories`.

### Categoria Padrão do Sistema ("Outros")

Categoria reservada, uma para cada tipo de lançamento (Receita e Despesa), criada
junto com o usuário e usada quando nenhuma categoria é informada.

**Em código:** `categories.is_system = true`.

### Inativar

Impedir o uso futuro de uma conta ou categoria sem apagar o histórico.

**Em código:** `active = false`.

### Usuário Padrão

Único usuário do MVP. As entidades de negócio pertencem a um usuário, o que
permite múltiplos usuários no futuro.

**Em código:** tabela `users` (id 1) e coluna `user_id`.

---

## 3. Estruturas Financeiras

### Conta

Fonte financeira real do usuário (ex.: conta corrente, carteira, investimentos).
Possui um Saldo Inicial e uma Data de Início.

**Em código:** tabela `accounts`.

### Saldo Inicial

Quanto a conta tinha quando o rastreamento começou. É o ponto de partida dos
saldos e não é receita nem despesa.

**Em código:** `initial_balance`.

### Data de Início

Dia a partir do qual a conta é rastreada.

**Em código:** `start_date`.

### Transferência

Movimentação de dinheiro entre duas contas do próprio usuário. Não é receita nem
despesa: apenas muda onde o dinheiro está.

**Em código:** tabela `transfers`.

### Parcelamento

Divisão de uma operação financeira em parcelas mensais vinculadas, geradas
automaticamente.

**Em código:** tabela `installments`.

### Parcela

Lançamento gerado por um Parcelamento, numerado de 1 a N, com valores e datas
próprios.

**Em código:** `transactions` com `installment_id` e `installment_number`.
