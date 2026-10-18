# 00 — Glossário e Linguagem Ubíqua

- **Status:** Rascunho
- **Versão:** 0.7
- **Última atualização:** 18-10-2026

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

### Data de Consulta (D)

Data para a qual se consulta o saldo ou a projeção. Não é armazenada: é o
parâmetro da consulta.

**Em código:** `as_of`.

### Eixo de Caixa

Dimensão temporal que considera o momento em que o dinheiro realmente se move: a
[Data Realizada](#data-realizada), para [lançamentos](#lançamento)
[Realizados](#realizado), e a [Data Prevista](#data-prevista), para os
[Previstos](#previsto). É o eixo da [Visão Diária](#visão-diária-mensal-e-anual).

**Em código:** `cash` (usa `transaction_date` e `due_date`).

### Eixo de Competência

Dimensão temporal que atribui o [lançamento](#lançamento) ao período (mês/ano)
ao qual ele pertence financeiramente, independentemente de quando o dinheiro sai
da [conta](#conta). É o eixo das
[Visões Mensal e Anual](#visão-diária-mensal-e-anual).

**Em código:** `accrual` (usa `accounting_month`).

### Mês de Competência

Mês ao qual um [lançamento](#lançamento) pertence para fins de planejamento.

**Em código:** `accounting_month`.

### Reserva (Competência Antecipada)

[Lançamento](#lançamento), de [receita](#receita) ou [despesa](#despesa), cujo
[Mês de Competência](#mês-de-competência) é anterior ao mês da sua
[Data Prevista](#data-prevista). Usada para despesas cujo valor precisa ser
separado em um mês anterior ao do vencimento. Não move dinheiro e não altera o
caixa nem a [Visão Diária](#visão-diária-mensal-e-anual).

**Em código:** derivada, quando `accounting_month` é anterior ao mês de
`due_date`.

### Visão Diária, Mensal e Anual

A **diária** mostra o que acontece dia a dia, pelo
[Eixo de Caixa](#eixo-de-caixa). A **mensal** e a **anual** mostram o que
pertence ao período, pelo [Eixo de Competência](#eixo-de-competência), incluindo
as [Reservas](#reserva-competência-antecipada).

**Em código:** `daily`, `monthly` e `yearly`, agregações calculadas.

### Saldo Atual

Dinheiro que de fato está na [conta](#conta) [Hoje](#hoje). Considera apenas o
que já aconteceu; [lançamentos](#lançamento) [Previstos](#previsto) não entram.

**Em código:** `current_balance`, calculado.

### Saldo Projetado

Estimativa do saldo da [conta](#conta) na
[Data de Consulta](#data-de-consulta-d), considerando também os
[lançamentos](#lançamento) [Previstos](#previsto) até essa data.

**Em código:** `projected_balance`, calculado.

### Saldo Acumulado

[Saldo Inicial](#saldo-inicial) somado, período a período, ao
[Resultado](#resultado) e ao saldo das [Transferências](#transferência)
(recebidas menos enviadas). Existe a versão **confirmada** (só
[Realizados](#realizado)) e a **projetada** (Realizados e
[Previstos](#previsto)).

**Em código:** `cumulative_balance`, calculado.

### Resultado

[Receitas](#receita) menos [despesas](#despesa) de um período. Não inclui
[Transferências](#transferência) nem o [Saldo Inicial](#saldo-inicial).

**Em código:** `result`, calculado.

### Data Nominal

Data mensal calculada pelo [Parcelamento](#parcelamento) para uma
[Parcela](#parcela), antes de qualquer
[Ajuste para Dia Útil](#ajuste-para-dia-útil).

**Em código:** `nominal_date`, calculada na geração das Parcelas e não
armazenada.

### Dia Útil

Qualquer dia que não seja sábado, domingo ou feriado nacional.

**Em código:** `business_day`.

### Ajuste para Dia Útil

Postergação da [Data Prevista](#data-prevista) de uma [Parcela](#parcela) para o
primeiro [Dia Útil](#dia-útil) seguinte, quando a [Data Nominal](#data-nominal)
não é um Dia Útil.

**Em código:** `business_day_adjustment`.

---

## 2. Entidades e Estados do Sistema

### Lançamento

Registro individual de uma [receita](#receita) ou [despesa](#despesa),
[Prevista](#previsto) ou [Realizada](#realizado). É a unidade central do sistema.

**Em código:** tabela `transactions`.

### Receita

Entrada de dinheiro.

**Em código:** `type = 'I'` (Income).

### Despesa

Saída de dinheiro.

**Em código:** `type = 'E'` (Expense).

### Estado do Lançamento

Ciclo de vida de um [lançamento](#lançamento): [Previsto](#previsto),
[Realizado](#realizado) ou [Cancelado](#cancelado).

**Em código:** `status`.

### Previsto

Estado de um [lançamento](#lançamento) planejado, que ainda não aconteceu.

**Em código:** `status = 'P'` (Pending).

### Realizado

Estado de um [lançamento](#lançamento) confirmado, que já aconteceu.

**Em código:** `status = 'C'` (Confirmed).

### Cancelado

Estado de um [lançamento](#lançamento) retirado do fluxo financeiro, mantido
apenas para histórico.

**Em código:** `status = 'X'` (Canceled).

### Data Prevista

Data planejada para o pagamento ou recebimento; o vencimento.

**Em código:** `due_date`.

### Valor Previsto

Valor planejado.

**Em código:** `amount`.

### Data Realizada

Data em que o pagamento ou recebimento de fato ocorreu. Só existe em
[lançamentos](#lançamento) [Realizados](#realizado).

**Em código:** `transaction_date`.

### Valor Realizado

Valor efetivamente pago ou recebido. Só existe em [lançamentos](#lançamento)
[Realizados](#realizado).

**Em código:** `paid_amount`.

### Confirmar

Passar um [lançamento](#lançamento) de [Previsto](#previsto) para
[Realizado](#realizado), informando a [Data Realizada](#data-realizada) e o
[Valor Realizado](#valor-realizado).

**Em código:** transição de `status` de `P` para `C`.

### Vencido (Derivado)

Condição de um [lançamento](#lançamento) [Previsto](#previsto) cuja
[Data Prevista](#data-prevista) é anterior a [Hoje](#hoje). Não é salvo no banco
de dados: é calculado em tempo de execução.

**Em código:** `overdue`, calculado.

### Variação

Divergência entre o [Previsto](#previsto) e o [Realizado](#realizado):

- **Variação de Data:** diferença em dias entre a
  [Data Realizada](#data-realizada) e a [Data Prevista](#data-prevista).
  Positiva indica atraso, negativa indica adiantamento e zero indica pagamento em
  dia.

- **Variação de Valor:** diferença entre o [Valor Previsto](#valor-previsto) e o
  [Valor Realizado](#valor-realizado), positiva quando favorece o usuário
  ([despesa](#despesa) paga a menos ou [receita](#receita) recebida a mais).
  Também expressa em percentual do Valor Previsto.

**Em código:** `date_variation` e `value_variation`, calculadas.

### Estorno

Correção de um [lançamento](#lançamento) [Realizado](#realizado): o lançamento é
marcado como [Estornado](#estornado-derivado), com a
[Data do Estorno](#data-do-estorno), e o seu efeito é anulado a partir dessa
data. O lançamento permanece visível, com os seus valores e datas.

**Em código:** `reversal_date`.

### Estornado (Derivado)

Condição de um [lançamento](#lançamento) [Realizado](#realizado) que tem
[Data do Estorno](#data-do-estorno). Não é salvo no banco de dados.

**Em código:** `is_reversed`, calculado.

### Data do Estorno

Data a partir da qual o efeito de um [lançamento](#lançamento)
[Estornado](#estornado-derivado) é anulado.

**Em código:** `reversal_date`.

### Categoria

Classificação de um [lançamento](#lançamento) (ex.: Moradia, Salário). Tem tipo
de [receita](#receita) ou de [despesa](#despesa).

**Em código:** tabela `categories`.

### Categoria Padrão do Sistema ("Outros")

[Categoria](#categoria) reservada, uma para cada tipo de
[lançamento](#lançamento) ([receita](#receita) e [despesa](#despesa)), criada
junto com o usuário e usada quando nenhuma categoria é informada.

**Em código:** `categories.is_system = true`.

### Inativar

Impedir o uso futuro de uma [conta](#conta) ou [categoria](#categoria) sem
apagar o histórico.

**Em código:** `active = false`.

### Usuário Padrão

Único usuário do MVP. As entidades de negócio pertencem a um usuário, o que
permite múltiplos usuários no futuro.

**Em código:** tabela `users` (id 1) e coluna `user_id`.

---

## 3. Estruturas Financeiras

### Conta

Fonte financeira real do usuário (ex.: conta corrente, carteira, investimentos).
Possui um [Saldo Inicial](#saldo-inicial) e uma [Data de Início](#data-de-início).

**Em código:** tabela `accounts`.

### Saldo Inicial

Quanto a [conta](#conta) tinha quando o rastreamento começou. É o ponto de
partida dos saldos e não é [receita](#receita) nem [despesa](#despesa).

**Em código:** `initial_balance`.

### Data de Início

Dia a partir do qual a [conta](#conta) é rastreada.

**Em código:** `start_date`.

### Transferência

Movimentação de dinheiro entre duas [contas](#conta) do próprio usuário. Não é
[receita](#receita) nem [despesa](#despesa): apenas muda onde o dinheiro está.

**Em código:** tabela `transfers`.

### Parcelamento

Divisão de uma operação financeira em [Parcelas](#parcela) mensais vinculadas,
geradas automaticamente.

**Em código:** tabela `installments`.

### Parcela

[Lançamento](#lançamento) gerado por um [Parcelamento](#parcelamento), numerado
pela posição no Parcelamento, com valores e datas próprios.

**Em código:** `transactions` com `installment_id` e `installment_number`.
