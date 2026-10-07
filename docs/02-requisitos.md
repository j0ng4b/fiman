# 02 — Requisitos

- **Status:** Rascunho
- **Versão:** 0.1
- **Última atualização:** 07-10-2026

## Requisitos funcionais

| ID     | Descrição                                                                                                                                                         | Prioridade | Origem   | Status   |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- | -------- |
| RF-001 | O sistema deve permitir cadastrar, editar e inativar contas financeiras (ex.: Conta Corrente, Carteira, Investimentos).                                           | Must       | Visão §5 | Rascunho |
| RF-002 | O sistema deve permitir cadastrar e organizar categorias e subcategorias de receitas e despesas.                                                                  | Must       | Visão §5 | Rascunho |
| RF-003 | O sistema deve permitir registrar lançamentos pontuais (receitas e despesas) com estado "previsto/não confirmado" ou "realizado/pago".                            | Must       | Visão §5 | Rascunho |
| RF-004 | O sistema deve registrar separadamente `data_prevista` vs. `data_realizada` e `valor_previsto` vs. `valor_realizado` para cada lançamento.                        | Must       | Visão §5 | Rascunho |
| RF-005 | O sistema deve permitir criar lançamentos parcelados, gerando automaticamente as parcelas vinculadas com vencimentos subsequentes.                                | Must       | Visão §5 | Rascunho |
| RF-006 | O sistema deve permitir alterar individualmente o valor pago e a data de pagamento de uma parcela específica sem afetar as demais parcelas do vínculo.            | Must       | Visão §5 | Rascunho |
| RF-007 | O sistema deve permitir registrar transferências financeiras entre contas internas do usuário.                                                                    | Must       | Visão §5 | Rascunho |
| RF-008 | O sistema deve calcular e exibir métricas e saldos consolidados em visões diária, mensal e anual.                                                                 | Must       | Visão §5 | Rascunho |
| RF-009 | O sistema deve exibir indicadores visuais de status do lançamento (em dia, adiantado, em atraso) com base na comparação entre `data_prevista` e `data_realizada`. | Should     | Visão §5 | Rascunho |
| RF-010 | O sistema deve exibir a variação absoluta e percentual entre o `valor_previsto` e o `valor_realizado` em lançamentos consolidados.                                | Should     | Visão §5 | Rascunho |
| RF-011 | O sistema deve permitir realizar a projeção de saldo futuro considerando lançamentos previstos/agendados.                                                         | Should     | Visão §5 | Rascunho |
| RF-012 | O sistema deve permitir exportar os lançamentos filtrados para arquivos no formato CSV.                                                                           | Should     | Visão §5 | Rascunho |
| RF-013 | O sistema deve permitir importar lançamentos de receitas e despesas a partir de um arquivo CSV estruturado.                                                       | Should     | Visão §5 | Rascunho |

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
