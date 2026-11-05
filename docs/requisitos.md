# Requisitos

- **Status:** Pronto
- **Versão:** 1.0
- **Última atualização:** 05-11-2026

O que o sistema deve fazer (RF) e as qualidades que deve ter (RNF). Os termos
estão no [glossário](glossario.md); as fórmulas e restrições, em
[regras](regras.md).

**Prioridade:** `Must` e `Should` entram no MVP. `Won't` fica para depois do MVP
(ver [visão](visao.md)).

**Formato:** `O sistema deve {verbo} {objeto} {condição}`. Um requisito é uma
verificação possível.

**Numeração:** os IDs seguem a ordem das seções. Quando um requisito novo for
criado, ele recebe o próximo número livre e fica na seção a que pertence, mesmo
que o número fique fora de ordem.

---

## Requisitos funcionais

### Contas

|   ID   | Descrição                                                                                          | Prioridade |
| :----: | -------------------------------------------------------------------------------------------------- | :--------: |
| RF-001 | O sistema deve permitir cadastrar, editar e inativar contas.                                       |    Must    |
| RF-002 | O sistema deve exigir, ao cadastrar uma conta, o saldo inicial e a data de início do rastreamento. |    Must    |

**Exemplos**

- Cadastrar conta com saldo inicial de 1.500,00 e data de início 09/10/2026: o
  saldo atual é 1.500,00 e o resultado de outubro continua 0,00.
- Conta com saldo inicial de 1.500,00 e uma despesa Realizada: alterar o saldo
  inicial é rejeitado.

### Categorias

|   ID   | Descrição                                                                                             | Prioridade |
| :----: | ----------------------------------------------------------------------------------------------------- | :--------: |
| RF-003 | O sistema deve permitir cadastrar, editar e inativar categorias de receita e de despesa.              |    Must    |
| RF-004 | O sistema deve atribuir a categoria padrão do tipo do lançamento a lançamentos criados sem categoria. |    Must    |

**Exemplo**

- Registrar uma despesa de 50,00 sem informar a categoria: ela é criada na
  categoria padrão "Outros" de despesa.

### Lançamentos

|   ID   | Descrição                                                                                                                                                         | Prioridade |
| :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------: |
| RF-005 | O sistema deve permitir registrar lançamentos (receitas e despesas) como Previstos ou Realizados.                                                                 |    Must    |
| RF-006 | O sistema deve registrar, em cada lançamento, a data prevista e o valor previsto e, quando Realizado, a data realizada e o valor realizado.                       |    Must    |
| RF-007 | O sistema deve permitir informar, em um lançamento, um mês de competência igual ou anterior ao mês da data prevista, assumindo por padrão o mês da data prevista. |    Must    |
| RF-008 | O sistema deve permitir confirmar um lançamento Previsto, informando a data realizada e o valor realizado.                                                        |    Must    |
| RF-009 | O sistema deve manter o mês de competência de um lançamento ao confirmá-lo.                                                                                       |    Must    |
| RF-010 | O sistema deve permitir editar e cancelar lançamentos Previstos.                                                                                                  |    Must    |
| RF-011 | O sistema deve permitir estornar um lançamento Realizado, registrando a data do estorno no próprio lançamento, que permanece visível.                             |   Should   |
| RF-012 | O sistema deve indicar, em cada lançamento, o estado e a pontualidade: Previsto, Vencido, Realizado em dia, Realizado adiantado ou Realizado atrasado.            |   Should   |
| RF-013 | O sistema deve exibir a variação de valor, absoluta e percentual, dos lançamentos Realizados.                                                                     |   Should   |
| RF-014 | O sistema deve listar os lançamentos, com filtro por período, conta, categoria e estado.                                                                          |    Must    |

**Exemplos**

- Conta de luz Prevista de 120,00 para 10/10, confirmada com 118,50 em 08/10: o
  lançamento fica Realizado, adiantado em 2 dias, com variação de valor de 1,50 a
  favor do usuário.
- Registrar uma despesa já Realizada de 85,00 em 10/10: o valor previsto é 85,00
  e a data prevista é 10/10. O lançamento aparece como em dia.
- Lançamento Previsto com data prevista 05/10, consultado em 09/10: aparece como
  Vencido.
- Despesa Prevista de 400,00 com data prevista 02/10 e mês de competência
  09/2026: entra no planejado de setembro, não no de outubro. Confirmada em
  03/10, continua em setembro.
- Despesa Realizada de 120,00 em 08/10: alterar o valor realizado é rejeitado.
  Estornada em 09/10, o original continua com 120,00 em 08/10, e o efeito é
  anulado a partir de 09/10.
- Despesa Prevista cancelada: o estado passa a Cancelado e ela deixa de entrar no
  saldo projetado.

### Parcelamento

|   ID   | Descrição                                                                                                                             | Prioridade |
| :----: | ------------------------------------------------------------------------------------------------------------------------------------- | :--------: |
| RF-015 | O sistema deve permitir criar um parcelamento, gerando automaticamente as parcelas mensais vinculadas.                                |    Must    |
| RF-016 | O sistema deve permitir confirmar uma parcela sem afetar as demais parcelas do mesmo parcelamento.                                    |    Must    |
| RF-017 | O sistema deve permitir, ao criar um parcelamento, aplicar a todas as parcelas o mês de competência anterior ao mês da data prevista. |   Should   |

**Exemplos**

- Parcelamento de 100,00 em 3 parcelas: os valores previstos são 33,34, 33,33 e
  33,33.
- Parcelamento de 203,49 em 3 parcelas de 67,83. Confirmar a parcela 1 com 67,80:
  as parcelas 2 e 3 continuam com 67,83.
- Parcelamento de 3 parcelas de 100,00 com a primeira em 02/10, com competência
  no mês anterior: as parcelas vencem em 02/10, 02/11 e 02/12, e os meses de
  competência são 09/2026, 10/2026 e 11/2026.

### Transferências

|   ID   | Descrição                                                                 | Prioridade |
| :----: | ------------------------------------------------------------------------- | :--------: |
| RF-018 | O sistema deve permitir registrar transferências entre contas do usuário. |    Must    |

**Exemplos**

- "Conta Corrente" com 1.000,00 e "Investimentos" com 500,00. Transferir 300,00
  da primeira para a segunda: os saldos passam a 700,00 e 800,00.
- Em outubro, receita Realizada de 500,00, despesa Realizada de 200,00 e
  transferência de 300,00 para outra conta: a visão mensal mostra resultado de
  300,00 e transferências enviadas de 300,00.

### Visões e saldos

|   ID   | Descrição                                                                                                                                               | Prioridade |
| :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------: |
| RF-019 | O sistema deve exibir o saldo atual de cada conta.                                                                                                      |    Must    |
| RF-020 | O sistema deve exibir o saldo projetado de uma conta para uma data de consulta, considerando os lançamentos Previstos.                                  |    Must    |
| RF-021 | O sistema deve calcular a visão diária pela data realizada (Realizados) e pela data prevista (Previstos), ignorando o mês de competência.               |    Must    |
| RF-022 | O sistema deve calcular as visões mensal e anual, previstas e realizadas, pelo mês de competência do lançamento, e não pela data prevista ou realizada. |    Must    |
| RF-023 | O sistema deve exibir, nas visões diária, mensal e anual, as receitas, as despesas, as transferências, o resultado e o saldo acumulado de cada conta.   |    Must    |

**Exemplos**

- Conta com saldo atual de 1.000,00, receita Prevista de 500,00 em 20/10 e
  despesa Prevista de 200,00 em 25/10: o saldo projetado para 31/10 é 1.300,00.
- Despesa com data prevista 01/01/2027 e mês de competência 12/2026: entra na
  visão anual de 2026, e não na de 2027.
- Despesa de 400,00 com data prevista 02/10 e competência 09/2026: a visão diária
  mostra a despesa em 02/10, e a visão mensal, em setembro.

### Depois do MVP

Descrição completa de cada item na [visão](visao.md).

|   ID   | Descrição                                                                                                                                                                                   | Prioridade |
| :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------: |
| RF-024 | O sistema deve permitir exportar os lançamentos filtrados para arquivos no formato CSV.                                                                                                     |   Won't    |
| RF-025 | O sistema deve permitir importar lançamentos de receitas e despesas a partir de um arquivo CSV estruturado.                                                                                 |   Won't    |
| RF-026 | O sistema deve ajustar para o primeiro dia útil seguinte a data prevista das parcelas geradas que caírem em fim de semana ou feriado nacional, permitindo ao usuário alterá-la manualmente. |   Won't    |

---

## Requisitos não funcionais

|   ID    | Categoria        | Descrição                                                                              | Critério                                                                                        | Prioridade |
| :-----: | ---------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | :--------: |
| RNF-001 | Desempenho       | Listagem de lançamentos filtrada por período.                                          | Resposta < 300 ms com até 10.000 lançamentos.                                                   |   Should   |
| RNF-002 | Usabilidade      | Inclusão rápida de novos lançamentos a partir da tela inicial.                         | No máximo 3 cliques ou toques a partir do Dashboard.                                            |   Should   |
| RNF-003 | Arquitetura      | Preparação do modelo de dados para múltiplos usuários.                                 | Todas as entidades de negócio têm o campo `user_id`, mesmo no MVP com um só usuário.            |    Must    |
| RNF-004 | Compatibilidade  | Interface web responsiva, projetada primeiro para celular (mobile-first).              | Funcional em telas de desktop e de celular.                                                     |   Should   |
| RNF-005 | Integridade      | Operações que alteram mais de um registro (transferência e parcelamento) são atômicas. | Uma falha no meio da operação não deixa dados parciais.                                         |    Must    |
| RNF-006 | Manutenibilidade | Testes automatizados das regras de negócio.                                            | Cobertura ≥ 80% da camada de regras de negócio.                                                 |   Could    |
| RNF-007 | Desempenho       | Exibição das visões diária, mensal e anual e do saldo projetado.                       | Resposta < 1 s com até 10.000 lançamentos.                                                      |   Should   |
| RNF-008 | Segurança        | Enquanto não houver autenticação, a API não é acessível publicamente.                  | Escuta apenas em `localhost` ou rede privada.                                                   |   Should   |
| RNF-009 | Integridade      | Valores monetários sem erro de arredondamento.                                         | A soma das parcelas é sempre igual ao valor total; nenhuma operação gera diferença de centavos. |    Must    |
