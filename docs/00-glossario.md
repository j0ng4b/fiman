# 00 — Glossário e Linguagem Ubíqua

- **Status:** Rascunho
- **Versão:** 0.6
- **Última atualização:** 17-10-2026

Este documento estabelece a Linguagem Ubíqua do sistema: o vocabulário comum dos
documentos, do código e do banco. Os documentos usam termos em português; o
código e o banco usam inglês. Cada termo traz a linha **Em código** com o nome
correspondente, no formato do schema do banco (snake_case).

Convenção de escrita: Nos textos da documentação, os termos definidos neste
glossário devem ser escritos com inicial maiúscula (ex.:
[Hoje](00-glossario.md#hoje), [Lançamento](00-glossario.md#lançamento),
[Data Prevista](00-glossario.md#data-prevista)) sempre que se referirem aos
conceitos oficiais do domínio, distinguindo-os de usos comuns ou genéricos.

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
[Data Realizada](00-glossario.md#data-realizada), para lançamentos realizados, e a
[Data Prevista](00-glossario.md#data-prevista), para os previstos. É o eixo da
[Visão Diária, Mensal e Anual](00-glossario.md#visão-diária-mensal-e-anual).

**Em código:** `cash` (usa `transaction_date` e `due_date`).

### Eixo de Competência

Dimensão temporal que atribui o lançamento ao período (mês/ano) ao qual ele
pertence financeiramente, independentemente de quando o dinheiro sai da conta.
É o eixo das Visões Mensal e Anual.

**Em código:** `accrual` (usa `accounting_month`).

### Mês de Competência

Mês ao qual um lançamento pertence para fins de planejamento.

**Em código:** `accounting_month`.

### Reserva (Competência Antecipada)

[Lançamento](00-glossario.md#lançamento), de [Receita](00-glossario.md#receita)
ou [Despesa](00-glossario.md#despesa), cujo
[Mês de Competência](00-glossario.md#mês-de-competência) é anterior ao mês da
sua [Data Prevista](00-glossario.md#data-prevista). Usada para contas cujo valor
precisa ser separado em um mês anterior ao do vencimento. Não move dinheiro e
não altera o caixa nem a visão diária.

**Em código:** derivada, quando `accounting_month` é anterior ao mês de
`due_date`.

### Visão Diária, Mensal e Anual

A **diária** mostra o que acontece dia a dia, pelo
[Eixo de Caixa](00-glossario.md#eixo-de-caixa). A **mensal** e a **anual**
mostram o que pertence ao período, pelo
[Eixo de Competência](00-glossario.md#eixo-de-competência), incluindo as
reservas.

**Em código:** `daily`, `monthly` e `yearly`, agregações calculadas.

### Saldo Atual

Dinheiro que de fato está na conta hoje. Considera apenas o que já aconteceu;
lançamentos previstos não entram.

**Em código:** `current_balance`, calculado.

### Saldo Projetado

Estimativa do saldo da conta na
[Data de Consulta](00-glossario.md#data-de-consulta-d), considerando também
os lançamentos previstos até essa data.

**Em código:** `projected_balance`, calculado.

### Saldo Acumulado

[Saldo Inicial](00-glossario.md#saldo-inicial) somado, período a período, ao
[Resultado](00-glossario.md#resultado) e às
[Transferências](00-glossario.md#transferência) recebidas e enviadas. Existe a
versão **confirmada** (só realizados) e a **projetada** (realizados e previstos).

**Em código:** `cumulative_balance`, calculado.

### Resultado

Receitas menos despesas de um período. Não inclui transferências nem o
[Saldo Inicial](00-glossario.md#saldo-inicial).

**Em código:** `result`, calculado.

### Data Nominal

Data mensal calculada pelo [Parcelamento](00-glossario.md#parcelamento) para uma
parcela, antes de qualquer
[Ajuste para Dia Útil](00-glossario.md#ajuste-para-dia-útil).

**Em código:** `nominal_date`, calculada na geração das parcelas e não
armazenada.

### Dia Útil

Qualquer dia que não seja sábado, domingo ou feriado nacional.

**Em código:** `business_day`.

### Ajuste para Dia Útil

Postergação da [Data Prevista](00-glossario.md#data-prevista) de uma parcela
para o primeiro [Dia Útil](00-glossario.md#dia-útil) seguinte, quando a
[Data Nominal](00-glossario.md#data-nominal) não é um
[Dia Útil](00-glossario.md#dia-útil).

**Em código:** `business_day_adjustment`.

---

## 2. Entidades e Estados do Sistema

### Lançamento

Registro individual de uma [Receita](00-glossario.md#receita) ou
[Despesa](00-glossario.md#despesa), prevista ou realizada. É a unidade central
do sistema. [Transferências](00-glossario.md#transferência) não são lançamentos.

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

Passar um lançamento de Previsto para Realizado, informando a
[Data Realizada](00-glossario.md#data-realizada) e o
[Valor Realizado](00-glossario.md#valor-realizado).

**Em código:** transição de `status` de `P` para `C`.

### Vencido (Derivado)

Condição de um lançamento Previsto cuja
[Data Prevista](00-glossario.md#data-prevista) é anterior a
[Hoje](00-glossario.md#hoje). Não é salvo no banco de dados: é calculado em
tempo de execução.

**Em código:** `overdue`, calculado.

### Variação

Divergência entre o planejado e o executado:

- **Variação de Data:** diferença em dias entre a
  [Data Realizada](00-glossario.md#data-realizada) e a
  [Data Prevista](00-glossario.md#data-prevista). Positiva indica atraso,
  negativa indica adiantamento e zero indica pagamento em dia.

- **Variação de Valor:** diferença entre o
  [Valor Previsto](00-glossario.md#valor-previsto) e o
  [Valor Realizado](00-glossario.md#valor-realizado), positiva quando favorece o
  usuário (despesa paga a menos ou receita recebida a mais). Também expressa em
  percentual do [Valor Previsto](00-glossario.md#valor-previsto).

**Em código:** `date_variation` e `value_variation`, calculadas.

### Estorno

Correção de um lançamento Realizado: o lançamento é marcado como estornado, com
a [Data do Estorno](00-glossario.md#data-do-estorno), e o seu efeito é anulado a
partir dessa data. O lançamento permanece visível, com os seus valores e datas.

**Em código:** `reversal_date`.

### Estornado (Derivado)

Condição de um lançamento Realizado que tem
[Data do Estorno](00-glossario.md#data-do-estorno). Não é salvo no banco de
dados.

**Em código:** `is_reversed`, calculado.

### Data do Estorno

Data a partir da qual o efeito de um lançamento estornado é anulado.

**Em código:** `reversal_date`.

### Categoria

Classificação de um lançamento (ex.: Moradia, Salário). Tem tipo de receita ou
de despesa.

**Em código:** tabela `categories`.

### Categoria Padrão do Sistema ("Outros")

Categoria reservada, uma para cada tipo de lançamento
([Receita](00-glossario.md#receita) e [Despesa](00-glossario.md#despesa)),
criada junto com o usuário e usada quando nenhuma categoria é informada.

**Em código:** `categories.is_system = true`.

### Inativar

Impedir o uso futuro de uma [Conta](00-glossario.md#conta) ou
[Categoria](00-glossario.md#categoria) sem apagar o histórico.

**Em código:** `active = false`.

### Usuário Padrão

Único usuário do MVP. As entidades de negócio pertencem a um usuário, o que
permite múltiplos usuários no futuro.

**Em código:** tabela `users` (id 1) e coluna `user_id`.

---

## 3. Estruturas Financeiras

### Conta

Fonte financeira real do usuário (ex.: conta corrente, carteira, investimentos).
Possui um [Saldo Inicial](00-glossario.md#saldo-inicial) e uma
[Data de Início](00-glossario.md#data-de-início).

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

[Lançamento](00-glossario.md#lançamento) gerado por um
[Parcelamento](00-glossario.md#parcelamento), numerado pela posição no
[Parcelamento](00-glossario.md#parcelamento), com valores e datas próprios.

**Em código:** `transactions` com `installment_id` e `installment_number`.
