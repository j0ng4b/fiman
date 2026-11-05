# Glossário

- **Status:** Pronto
- **Versão:** 1.0
- **Última atualização:** 05-11-2026

Vocabulário do sistema. Os docs usam o termo em português já o código e o banco
usam o nome da coluna **Em código**. Quem é "calculado" não é salvo no banco.

## Lançamentos

| Termo              | Significa                                                                                                                                           | Em código                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Lançamento         | Uma receita ou despesa. É a unidade central do sistema                                                                                              | tabela `transactions`                           |
| Receita / Despesa  | Entrada / saída de dinheiro                                                                                                                         | `type` = `I` / `E`                              |
| Previsto           | Lançamento planejado, que ainda não aconteceu                                                                                                       | `status` = `P`                                  |
| Realizado          | Lançamento que já aconteceu                                                                                                                         | `status` = `C`                                  |
| Cancelado          | Lançamento previsto que foi descartado (fica só no histórico)                                                                                       | `status` = `X`                                  |
| Data prevista      | Vencimento: quando deveria pagar ou receber                                                                                                         | `due_date`                                      |
| Valor previsto     | Valor planejado                                                                                                                                     | `amount`                                        |
| Data realizada     | Dia em que pagou ou recebeu de fato. Só existe em Realizado                                                                                         | `transaction_date`                              |
| Valor realizado    | Valor pago ou recebido de fato. Só existe em Realizado                                                                                              | `paid_amount`                                   |
| Confirmar          | Passar de Previsto para Realizado, informando data e valor realizados                                                                               | `status` de `P` para `C`                        |
| Vencido            | Previsto cuja data prevista é anterior a hoje                                                                                                       | `overdue`, calculado                            |
| Variação           | Diferença entre previsto e realizado, em dias (data) e em valor                                                                                     | `date_variation`, `value_variation`, calculados |
| Estorno            | Anula um lançamento realizado a partir de uma data, sem apagá-lo                                                                                    | `reversal_date`                                 |
| Mês de competência | Mês do orçamento a que o lançamento pertence. Pode ser anterior ao mês do vencimento (assim se reserva em um mês uma despesa que vence no seguinte) | `accounting_month`                              |
| Categoria          | Classificação do lançamento (Moradia, Salário...). Tem tipo receita ou despesa                                                                      | tabela `categories`                             |
| Categoria padrão   | "Outros": uma por tipo, usada quando nenhuma categoria é informada                                                                                  | `categories.is_system = true`                   |

## Contas e movimentações

| Termo          | Significa                                                                | Em código                                            |
| -------------- | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| Conta          | Onde o dinheiro está (conta corrente, carteira, investimentos)           | tabela `accounts`                                    |
| Saldo inicial  | Quanto a conta tinha quando começou a ser rastreada. Não é receita       | `initial_balance`                                    |
| Data de início | Dia a partir do qual a conta é rastreada                                 | `start_date`                                         |
| Transferência  | Dinheiro que muda de uma conta sua para outra. Não é receita nem despesa | tabela `transfers`                                   |
| Parcelamento   | Divide uma operação em parcelas mensais, geradas automaticamente         | tabela `installments`                                |
| Parcela        | Lançamento gerado por um parcelamento, com valor e data próprios         | `transactions.installment_id` e `installment_number` |
| Inativar       | Impedir novo uso de uma conta ou categoria sem apagar o histórico        | `active = false`                                     |

## Saldos e visões

| Termo                | Significa                                                                    | Em código                       |
| -------------------- | ---------------------------------------------------------------------------- | ------------------------------- |
| Hoje                 | Data atual do sistema                                                        | `today`                         |
| Data de consulta     | Data para a qual se consulta o saldo projetado (é parâmetro, não é salva)    | `as_of`                         |
| Saldo atual          | Dinheiro que está na conta hoje (só realizados)                              | `current_balance`, calculado    |
| Saldo projetado      | Saldo estimado na data de consulta, incluindo os previstos                   | `projected_balance`, calculado  |
| Resultado            | Receitas menos despesas de um período (sem transferências nem saldo inicial) | `result`, calculado             |
| Saldo acumulado      | Saldo inicial somado, período a período, ao resultado e às transferências    | `cumulative_balance`, calculado |
| Visão diária         | Dia a dia, pela **data do dinheiro** (data realizada ou data prevista)       | `daily`                         |
| Visão mensal e anual | Por período, pelo **mês de competência**                                     | `monthly`, `yearly`             |

## Por que existem duas datas

A visão diária mostra quando o dinheiro se move; a mensal e a anual mostram a
qual mês o lançamento pertence no orçamento. Exemplo: uma fatura que vence em
02/10 pode ter mês de competência 09/2026. Em setembro o valor já entra no
planejado, mas o dinheiro só sai em outubro.
