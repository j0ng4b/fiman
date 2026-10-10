# 02 — Requisitos

- **Status:** Rascunho
- **Versão:** 0.3
- **Última atualização:** 10-10-2026

## Requisitos funcionais

| ID     | Descrição                                                                                                                                                                                                 | Prioridade | Origem   | Status   |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- | -------- |
| RF-001 | O sistema deve permitir cadastrar, editar e inativar contas financeiras.                                                                                                                                  | Must       | Visão §5 | Rascunho |
| RF-002 | O sistema deve permitir cadastrar e organizar categorias de receitas e despesas.                                                                                                                          | Must       | Visão §5 | Rascunho |
| RF-003 | O sistema deve permitir registrar lançamentos pontuais (receitas e despesas) com estado "previsto" ou "realizado/pago".                                                                                   | Must       | Visão §5 | Rascunho |
| RF-004 | O sistema deve registrar separadamente `data_prevista` vs. `data_realizada` e `valor_previsto` vs. `valor_realizado` para cada lançamento.                                                                | Must       | Visão §5 | Rascunho |
| RF-005 | O sistema deve permitir criar lançamentos parcelados, gerando automaticamente as parcelas vinculadas com vencimentos subsequentes.                                                                        | Must       | Visão §5 | Rascunho |
| RF-006 | O sistema deve permitir informar individualmente, ao confirmar, o valor pago e a data de pagamento de uma parcela específica sem afetar as demais parcelas do vínculo.                                    | Must       | Visão §5 | Rascunho |
| RF-007 | O sistema deve permitir registrar transferências financeiras entre contas internas do usuário.                                                                                                            | Must       | Visão §5 | Rascunho |
| RF-008 | O sistema deve calcular e exibir métricas e saldos consolidados em visões diária, mensal e anual.                                                                                                         | Must       | Visão §5 | Rascunho |
| RF-009 | O sistema deve exibir indicadores visuais de status do lançamento (em dia, adiantado, em atraso) com base na comparação entre `data_prevista` e `data_realizada`.                                         | Should     | Visão §5 | Rascunho |
| RF-010 | O sistema deve exibir a variação absoluta e percentual entre o `valor_previsto` e o `valor_realizado` em lançamentos consolidados.                                                                        | Should     | Visão §5 | Rascunho |
| RF-011 | O sistema deve permitir realizar a projeção de saldo futuro considerando lançamentos previstos/agendados.                                                                                                 | Should     | Visão §5 | Rascunho |
| RF-012 | O sistema deve permitir exportar os lançamentos filtrados para arquivos no formato CSV.                                                                                                                   | Should     | Visão §5 | Rascunho |
| RF-013 | O sistema deve permitir importar lançamentos de receitas e despesas a partir de um arquivo CSV estruturado.                                                                                               | Should     | Visão §5 | Rascunho |
| RF-014 | O sistema deve permitir informar, em um lançamento, um `mes_competencia` anterior ou igual ao mês da `data_prevista` (reserva), assumindo por padrão o mês da `data_prevista`.                            | Must       | Visão §5 | Rascunho |
| RF-015 | O sistema deve calcular as métricas mensais e anuais, previstas e realizadas, pelo `mes_competencia` do lançamento (e não pela `data_prevista` ou `data_realizada`).                                      | Must       | Visão §5 | Rascunho |
| RF-016 | O sistema deve calcular as métricas diárias exclusivamente no eixo de caixa (`data_realizada` para realizados e `data_prevista` para previstos), sem considerar o `mes_competencia`.                      | Must       | Visão §5 | Rascunho |
| RF-017 | O sistema deve permitir aplicar o mês de competência anterior ao vencimento a todas as parcelas ao criar um lançamento parcelado.                                                                         | Should     | Visão §5 | Rascunho |
| RF-018 | O sistema deve manter o `mes_competencia` de um lançamento após o pagamento, alterando-o somente por edição explícita enquanto o lançamento estiver previsto.                                             | Must       | Visão §5 | Rascunho |
| RF-019 | O sistema deve permitir informar, ao cadastrar uma conta, o saldo inicial e a data de início do rastreamento, e permitir alterá-los enquanto a conta não tiver lançamentos realizados nem transferências. | Must       | Visão §5 | Rascunho |
| RF-020 | O sistema deve ajustar para o primeiro dia útil seguinte a data prevista das parcelas geradas que caírem em fim de semana ou feriado nacional, permitindo ao usuário alterá-la manualmente.               | Should     | Visão §5 | Rascunho |
| RF-021 | O sistema deve permitir estornar um lançamento realizado, mantendo o original e criando um lançamento inverso vinculado a ele.                                                                            | Should     | Visão §5 | Rascunho |
| RF-022 | O sistema deve permitir editar e cancelar lançamentos previstos.                                                                                                                                          | Must       | Visão §5 | Rascunho |

> Escrever no formato:
>
>     O sistema deve {verbo} {objeto} {condição/contexto}
>
> Um requisito = uma verificação possível.

## Requisitos não funcionais

| ID      | Categoria        | Descrição                                                                                          | Métrica/Critério                                                                                        | Prioridade | Status   |
| ------- | ---------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------- | -------- |
| RNF-001 | Desempenho       | Consulta e listagem de lançamentos filtrados por período.                                          | Tempo de resposta < 300 ms para até 10.000 registros.                                                   | Should     | Rascunho |
| RNF-002 | Usabilidade      | Inclusão rápida de novos lançamentos a partir da tela inicial.                                     | No máximo 3 cliques ou toques a partir do Dashboard.                                                    | Should     | Rascunho |
| RNF-003 | Arquitetura      | Isolamento do esquema de banco para viabilizar suporte futuro a múltiplos usuários (Multi-tenant). | Todas as entidades de negócio devem conter o campo `user_id` mapeado, mesmo no MVP mono-usuário.        | Must       | Rascunho |
| RNF-004 | Portabilidade    | Compatibilidade e responsividade da interface web.                                                 | Funcionamento fluido em telas desktop e dispositivos móveis (Mobile-first via Tailwind CSS).            | Should     | Rascunho |
| RNF-005 | Integridade      | Garantia da consistência de saldo em movimentações entre contas.                                   | Operações de transferência devem ser executadas dentro de uma transação atômica (ACID) via Drizzle ORM. | Must       | Rascunho |
| RNF-006 | Manutenibilidade | Cobertura de testes automatizados na camada de regras de negócio (Domain/Services).                | Cobertura de testes unitários ≥ 80% nos serviços do NestJS.                                             | Could      | Rascunho |
| RNF-007 | Desempenho       | Cálculo das métricas mensais, anuais e do saldo projetado.                                         | Tempo de resposta < 1 s para horizonte de 12 meses.                                                     | Should     | Rascunho |
| RNF-008 | Segurança        | Enquanto não houver autenticação, a API não deve ficar acessível publicamente.                     | Escuta apenas em `localhost` ou rede privada.                                                           | Should     | Rascunho |
| RNF-009 | Integridade      | Valores monetários sem erro de ponto flutuante.                                                    | Armazenamento em centavos (inteiro) e aritmética inteira.                                               | Must       | Rascunho |

## Critérios de aceite

```gherkin
Funcionalidade: Controle duplo de execução (RF-003, RF-004)

  Cenário: Baixar lançamento com divergência de valor e adiantamento de data
    Dado que existe um lançamento previsto de "Conta de Luz" com valor_previsto de 120,00 e data_prevista "10/10/2026"
    Quando eu confirmo o pagamento informando valor_realizado de 118,50 e data_realizada "08/10/2026"
    Então o status do lançamento passa para "realizado"
    E o sistema indica um adiantamento de 2 dias no pagamento
    E o sistema registra uma variação positiva de 1,50 a favor do usuário
```

```gherkin
Funcionalidade: Transferência entre contas (RF-007, RNF-005)

  Cenário: Transferir saldo da Conta Corrente para Investimentos
    Dado que a conta "Conta Corrente" possui saldo de 1.000,00
    E a conta "Investimentos" possui saldo de 500,00
    Quando eu realizo uma transferência de 300,00 da "Conta Corrente" para "Investimentos"
    Então o saldo da "Conta Corrente" passa a ser 700,00
    E o saldo da conta "Investimentos" passa a ser 800,00
    E o sistema registra o histórico da movimentação com tipo "transferência"

  Cenário: Transferência visível na visão mensal sem afetar o resultado
    Dado a conta "Conta Corrente" com saldo inicial de 1.000,00, receita realizada de 500,00 e despesa realizada de 200,00 em outubro
    Quando eu transfiro 300,00 para "Investimentos" em outubro
    Então a visão mensal de outubro da "Conta Corrente" mostra receitas de 500,00, despesas de 200,00 e resultado de 300,00
    E mostra transferências enviadas de 300,00
    E o saldo final é 1.000,00
```

```gherkin
Funcionalidade: Parcelamento (RF-005, RF-006)

  Cenário: Ajustar valor real de uma parcela específica
    Dado uma compra parcelada em 3x de 67,83 no valor total de 203,49
    Quando a parcela 1/3 é confirmada com o valor real ajustado de 67,80 na fatura
    Então o valor realizado da parcela 1 passa a ser 67,80
    E as parcelas 2/3 e 3/3 permanecem com o valor previsto de 67,83 cada

  Cenário: Resto dos centavos na primeira parcela
    Dado uma compra de 100,00
    Quando eu crio o parcelamento em 3x
    Então as parcelas previstas são 33,34, 33,33 e 33,33
    E a soma das parcelas é 100,00
```

```gherkin
Funcionalidade: Reserva por mês de competência (RF-014, RF-015, RF-016, RF-018)

  Cenário: Reservar em setembro uma despesa que vence em outubro
    Dado uma despesa prevista "Fatura do cartão" de 400,00 com data_prevista "02/10/2026"
    Quando eu informo o mes_competencia "09/2026"
    Então a despesa conta no planejado de setembro
    E o planejado de outubro não inclui os 400,00
    E a visão diária de "30/09/2026" não inclui a despesa
    E a visão diária de "02/10/2026" mostra a despesa prevista de 400,00

  Cenário: Pagamento mantém a competência
    Dado a despesa "Fatura do cartão" com mes_competencia "09/2026"
    Quando eu confirmo o pagamento com valor_realizado de 400,00 e data_realizada "03/10/2026"
    Então a despesa conta como realizada em setembro
    E o realizado de outubro não inclui os 400,00
    E a visão diária de "03/10/2026" mostra a saída realizada de 400,00

  Cenário: Reserva de dezembro para pagamento em janeiro
    Dado uma despesa com data_prevista "01/01/2027" e mes_competencia "12/2026"
    Então ela conta nas métricas anuais de 2026 e não nas de 2027

  Cenário: Competência posterior ao vencimento é rejeitada
    Dado uma despesa com data_prevista "02/10/2026"
    Quando eu informo o mes_competencia "11/2026"
    Então o sistema rejeita o lançamento com a mensagem "O mês de competência não pode ser posterior ao vencimento"
```

```gherkin
Funcionalidade: Competência em parcelamento (RF-017)

  Cenário: Reservar cada parcela no mês anterior ao vencimento
    Dado uma compra parcelada em 3x de 100,00 com primeira parcela em "02/10/2026"
    Quando eu crio o parcelamento com a opção "competência no mês anterior"
    Então as parcelas vencem em 02/10, 02/11 e 02/12
    E os meses de competência são 09/2026, 10/2026 e 11/2026
```

```gherkin
Funcionalidade: Saldo inicial da conta (RF-019)

  Cenário: Começar a rastrear uma conta que já tem saldo
    Dado que eu cadastro a conta "Conta Corrente" com saldo inicial de 1.500,00 e data de início "09/10/2026"
    Quando eu consulto o saldo atual em "09/10/2026"
    Então o saldo atual é 1.500,00
    E as receitas e despesas de outubro continuam em 0,00

  Cenário: Lançamento anterior à data de início
    Dado a conta "Conta Corrente" com data de início "09/10/2026"
    Quando eu tento registrar uma despesa realizada com data_realizada "05/10/2026"
    Então o sistema rejeita o lançamento com a mensagem "A data é anterior ao início da conta"

  Cenário: Alterar o saldo inicial antes de qualquer movimentação
    Dado a conta com saldo inicial de 1.500,00 e nenhum lançamento realizado nem transferência
    Quando eu altero o saldo inicial para 1.800,00
    Então o saldo atual passa a ser 1.800,00

  Cenário: Alterar o saldo inicial depois de movimentações
    Dado a conta com saldo inicial de 1.500,00 e uma despesa realizada de 200,00
    Quando eu tento alterar o saldo inicial para 1.800,00
    Então o sistema rejeita com a mensagem "O saldo inicial não pode ser alterado após movimentações realizadas"
```

```gherkin
Funcionalidade: Ajuste de vencimento para dia útil (RF-020)

  Cenário: Parcelas que caem em fim de semana
    Dado uma compra de 300,00 parcelada em 3x com primeira parcela em "31/01/2026"
    Quando eu crio o parcelamento
    Então as datas nominais são 31/01/2026, 28/02/2026 e 31/03/2026
    E as datas previstas são 02/02/2026, 02/03/2026 e 31/03/2026
    E os meses de competência padrão são 01/2026, 02/2026 e 03/2026
```

```gherkin
Funcionalidade: Correção de lançamentos (RF-021, RF-022)

  Cenário: Editar um lançamento previsto
    Dado uma despesa prevista de 120,00 com data_prevista "10/10/2026"
    Quando eu altero o valor_previsto para 130,00
    Então o lançamento passa a ter valor_previsto de 130,00

  Cenário: Tentativa de editar um lançamento realizado
    Dado uma despesa realizada de 120,00
    Quando eu tento alterar o valor_realizado para 100,00
    Então o sistema rejeita com a mensagem "Lançamento realizado não pode ser editado; use o estorno"

  Cenário: Tentativa de cancelar um lançamento realizado
    Dado uma despesa realizada de 120,00
    Quando eu tento cancelar o lançamento
    Então o sistema rejeita com a mensagem "Lançamento realizado não pode ser cancelado; use o estorno"

  Cenário: Estornar um pagamento lançado com valor errado
    Dado uma despesa realizada de 120,00 em "08/10/2026"
    Quando eu estorno o lançamento em "09/10/2026"
    Então o original permanece com 120,00 em "08/10/2026"
    E é criado um estorno vinculado de 120,00 em "09/10/2026"
    E o saldo da conta volta ao valor anterior ao pagamento
    E as despesas de "09/10/2026" são reduzidas em 120,00
```
