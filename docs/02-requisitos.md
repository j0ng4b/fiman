# 02 — Requisitos

- **Status:** Rascunho
- **Versão:** 0.2
- **Última atualização:** 09-10-2026

## Requisitos funcionais

| ID     | Descrição                                                                                                                                                                            | Prioridade | Origem   | Status   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | -------- | -------- |
| RF-001 | O sistema deve permitir cadastrar, editar e inativar contas financeiras.                                                                                                             | Must       | Visão §5 | Rascunho |
| RF-002 | O sistema deve permitir cadastrar e organizar categorias de receitas e despesas.                                                                                                     | Must       | Visão §5 | Rascunho |
| RF-003 | O sistema deve permitir registrar lançamentos pontuais (receitas e despesas) com estado "previsto" ou "realizado/pago".                                                              | Must       | Visão §5 | Rascunho |
| RF-004 | O sistema deve registrar separadamente `data_prevista` vs. `data_realizada` e `valor_previsto` vs. `valor_realizado` para cada lançamento.                                           | Must       | Visão §5 | Rascunho |
| RF-005 | O sistema deve permitir criar lançamentos parcelados, gerando automaticamente as parcelas vinculadas com vencimentos subsequentes.                                                   | Must       | Visão §5 | Rascunho |
| RF-006 | O sistema deve permitir alterar individualmente o valor pago e a data de pagamento de uma parcela específica sem afetar as demais parcelas do vínculo.                               | Must       | Visão §5 | Rascunho |
| RF-007 | O sistema deve permitir registrar transferências financeiras entre contas internas do usuário.                                                                                       | Must       | Visão §5 | Rascunho |
| RF-008 | O sistema deve calcular e exibir métricas e saldos consolidados em visões diária, mensal e anual.                                                                                    | Must       | Visão §5 | Rascunho |
| RF-009 | O sistema deve exibir indicadores visuais de status do lançamento (em dia, adiantado, em atraso) com base na comparação entre `data_prevista` e `data_realizada`.                    | Should     | Visão §5 | Rascunho |
| RF-010 | O sistema deve exibir a variação absoluta e percentual entre o `valor_previsto` e o `valor_realizado` em lançamentos consolidados.                                                   | Should     | Visão §5 | Rascunho |
| RF-011 | O sistema deve permitir realizar a projeção de saldo futuro considerando lançamentos previstos/agendados.                                                                            | Should     | Visão §5 | Rascunho |
| RF-012 | O sistema deve permitir exportar os lançamentos filtrados para arquivos no formato CSV.                                                                                              | Should     | Visão §5 | Rascunho |
| RF-013 | O sistema deve permitir importar lançamentos de receitas e despesas a partir de um arquivo CSV estruturado.                                                                          | Should     | Visão §5 | Rascunho |
| RF-014 | O sistema deve permitir informar, em um lançamento, um `mes_competencia` anterior ou igual ao mês da `data_prevista` (reserva), assumindo por padrão o mês da `data_prevista`.       | Must       | Visão §5 | Rascunho |
| RF-015 | O sistema deve calcular as métricas mensais e anuais, previstas e realizadas, pelo `mes_competencia` do lançamento (e não pela `data_prevista` ou `data_realizada`).                 | Must       | Visão §5 | Rascunho |
| RF-016 | O sistema deve calcular as métricas diárias exclusivamente no eixo de caixa (`data_realizada` para realizados e `data_prevista` para previstos), sem considerar o `mes_competencia`. | Must       | Visão §5 | Rascunho |
| RF-017 | O sistema deve permitir aplicar o mês de competência anterior ao vencimento a todas as parcelas ao criar um lançamento parcelado.                                                    | Should     | Visão §5 | Rascunho |
| RF-018 | O sistema deve manter o `mes_competencia` de um lançamento após o pagamento, alterando-o somente por edição explícita.                                                               | Must       | Visão §5 | Rascunho |
| RF-019 | O sistema deve permitir informar, ao cadastrar uma conta, o saldo inicial e a data de início do rastreamento, e permitir alterá-los depois.                                          | Must       | Visão §5 | Rascunho |

> Escrever no formato: "O sistema deve <verbo> <objeto> <condição/contexto>". Um requisito = uma verificação possível.

## Requisitos não funcionais

| ID      | Categoria        | Descrição                                                                                          | Métrica/Critério                                                                                        | Prioridade |
| ------- | ---------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------- |
| RNF-001 | Desempenho       | Consulta e listagem de lançamentos filtrados por período.                                          | Tempo de resposta < 300 ms para até 10.000 registros.                                                   | Should     |
| RNF-002 | Usabilidade      | Inclusão rápida de novos lançamentos a partir da tela inicial.                                     | No máximo 3 cliques ou toques a partir do Dashboard.                                                    | Should     |
| RNF-003 | Arquitetura      | Isolamento do esquema de banco para viabilizar suporte futuro a múltiplos usuários (Multi-tenant). | Todas as entidades de negócio devem conter o campo `user_id` mapeado, mesmo no MVP mono-usuário.        | Must       |
| RNF-004 | Portabilidade    | Compatibilidade e responsividade da interface web.                                                 | Funcionamento fluido em telas desktop e dispositivos móveis (Mobile-first via Tailwind CSS).            | Should     |
| RNF-005 | Integridade      | Garantia da consistência de saldo em movimentações entre contas.                                   | Operações de transferência devem ser executadas dentro de uma transação atômica (ACID) via Drizzle ORM. | Must       |
| RNF-006 | Manutenibilidade | Cobertura de testes automatizados na camada de regras de negócio (Domain/Services).                | Cobertura de testes unitários ≥ 80% nos serviços do NestJS.                                             | Could      |
| RNF-007 | Desempenho       | Cálculo das métricas mensais, anuais e do saldo projetado.                                         | Tempo de resposta < 1 s para horizonte de 12 meses.                                                     | Should     |
| RNF-008 | Segurança        | Enquanto não houver autenticação, a API não deve ficar acessível publicamente.                     | Escuta apenas em `localhost` ou rede privada.                                                           | Should     |
| RNF-009 | Integridade      | Valores monetários sem erro de ponto flutuante.                                                    | Armazenamento em centavos (inteiro) e aritmética inteira.                                               | Must       |

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
```

```gherkin
Funcionalidade: Parcelamento não linear (RF-005, RF-006)

  Cenário: Ajustar valor real de uma parcela específica
    Dado uma compra parcelada em 3x de 67,83 no valor total de 203,49
    Quando a parcela 1/3 é quitada com o valor real ajustado de 67,80 na fatura
    Então o valor realizado da parcela 1 passa a ser 67,80
    E as parcelas 2/3 e 3/3 permanecem com o valor previsto de 67,83 cada
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

  Cenário: Alterar o saldo inicial recalcula os saldos
    Dado a conta com saldo inicial de 1.500,00 e uma despesa realizada de 200,00
    Quando eu altero o saldo inicial para 1.800,00
    Então o saldo atual passa de 1.300,00 para 1.600,00
```
