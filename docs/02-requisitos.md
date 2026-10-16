# 02 — Requisitos

- **Status:** Revisado
- **Versão:** 0.8
- **Última atualização:** 16-10-2026

## Requisitos funcionais

> **Prioridade:** o MVP reúne os requisitos Must e Should. `Won't` são os itens
> da seção "Depois do MVP" da visão.

| ID     | Descrição                                                                                                                                                                                         | Prioridade |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| RF-001 | O sistema deve permitir cadastrar, editar e inativar contas.                                                                                                                                      | Must       |
| RF-002 | O sistema deve permitir cadastrar, editar e inativar categorias de receita e de despesa.                                                                                                          | Must       |
| RF-003 | O sistema deve permitir registrar lançamentos (receitas e despesas) como Previstos ou Realizados.                                                                                                 | Must       |
| RF-004 | O sistema deve registrar, em cada lançamento, a Data Prevista e o Valor Previsto e, quando Realizado, a Data Realizada e o Valor Realizado.                                                       | Must       |
| RF-005 | O sistema deve permitir criar um Parcelamento, gerando automaticamente as Parcelas mensais vinculadas.                                                                                            | Must       |
| RF-006 | O sistema deve permitir confirmar um lançamento Previsto, informando a Data Realizada e o Valor Realizado, sem afetar os demais lançamentos (inclusive as outras Parcelas do mesmo Parcelamento). | Must       |
| RF-007 | O sistema deve permitir registrar Transferências entre contas do usuário.                                                                                                                         | Must       |
| RF-008 | O sistema deve exibir, nas visões diária, mensal e anual, as receitas, as despesas, as transferências, o Resultado e o Saldo Acumulado de cada conta.                                             | Must       |
| RF-009 | O sistema deve indicar, em cada lançamento, o seu estado e a sua pontualidade: Previsto, Vencido, Realizado em dia, Realizado adiantado ou Realizado atrasado.                                    | Should     |
| RF-010 | O sistema deve exibir a Variação de Valor, absoluta e percentual, dos lançamentos Realizados.                                                                                                     | Should     |
| RF-011 | O sistema deve exibir o Saldo Projetado de uma conta para uma Data de Consulta, considerando os lançamentos previstos.                                                                            | Must       |
| RF-012 | O sistema deve permitir exportar os lançamentos filtrados para arquivos no formato CSV.                                                                                                           | Won't      |
| RF-013 | O sistema deve permitir importar lançamentos de receitas e despesas a partir de um arquivo CSV estruturado.                                                                                       | Won't      |
| RF-014 | O sistema deve permitir informar, em um lançamento, um Mês de Competência anterior ou igual ao mês da Data Prevista (Reserva), assumindo por padrão o mês da Data Prevista.                       | Must       |
| RF-015 | O sistema deve calcular as visões mensal e anual, previstas e realizadas, pelo Mês de Competência do lançamento (e não pela Data Prevista ou pela Data Realizada).                                | Must       |
| RF-016 | O sistema deve calcular a visão diária exclusivamente no eixo de caixa (Data Realizada para realizados e Data Prevista para previstos), sem considerar o Mês de Competência.                      | Must       |
| RF-017 | O sistema deve permitir aplicar o Mês de Competência anterior ao vencimento a todas as Parcelas ao criar um Parcelamento.                                                                         | Should     |
| RF-018 | O sistema deve manter o Mês de Competência de um lançamento ao confirmá-lo.                                                                                                                       | Must       |
| RF-019 | O sistema deve exigir, ao cadastrar uma conta, o Saldo Inicial e a Data de Início do rastreamento.                                                                                                | Must       |
| RF-020 | O sistema deve ajustar para o primeiro dia útil seguinte a Data Prevista das Parcelas geradas que caírem em fim de semana ou feriado nacional, permitindo ao usuário alterá-la manualmente.       | Won't      |
| RF-021 | O sistema deve permitir estornar um lançamento Realizado, registrando a Data do Estorno no próprio lançamento, que permanece visível.                                                             | Should     |
| RF-022 | O sistema deve permitir editar e cancelar lançamentos Previstos.                                                                                                                                  | Must       |
| RF-023 | O sistema deve atribuir a Categoria Padrão do Sistema, do tipo do lançamento, a lançamentos criados sem categoria.                                                                                | Must       |
| RF-024 | O sistema deve exibir o Saldo Atual de cada conta.                                                                                                                                                | Must       |
| RF-025 | O sistema deve listar os lançamentos, com filtro por período, conta, categoria e estado.                                                                                                          | Must       |

> Escrever no formato:
>
>     O sistema deve {verbo} {objeto} {condição/contexto}
>
> Um requisito = uma verificação possível.

## Requisitos não funcionais

| ID      | Categoria        | Descrição                                                                              | Métrica/Critério                                                                                | Prioridade |
| ------- | ---------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| RNF-001 | Desempenho       | Listagem de lançamentos filtrada por período.                                          | Resposta < 300 ms com até 10.000 lançamentos.                                                   | Should     |
| RNF-002 | Usabilidade      | Inclusão rápida de novos lançamentos a partir da tela inicial.                         | No máximo 3 cliques ou toques a partir do Dashboard.                                            | Should     |
| RNF-003 | Arquitetura      | Preparação do modelo de dados para múltiplos usuários.                                 | Todas as entidades de negócio têm o campo `user_id`, mesmo no MVP com um só usuário.            | Must       |
| RNF-004 | Compatibilidade  | Interface web responsiva, projetada primeiro para celular (mobile-first).              | Funcional em telas de desktop e de celular.                                                     | Should     |
| RNF-005 | Integridade      | Operações que alteram mais de um registro (Transferência e Parcelamento) são atômicas. | Uma falha no meio da operação não deixa dados parciais.                                         | Must       |
| RNF-006 | Manutenibilidade | Testes automatizados das regras de negócio.                                            | Cobertura ≥ 80% da camada de regras de negócio.                                                 | Should     |
| RNF-007 | Desempenho       | Exibição das visões diária, mensal e anual e do Saldo Projetado.                       | Resposta < 1 s com até 10.000 lançamentos.                                                      | Should     |
| RNF-008 | Segurança        | Enquanto não houver autenticação, a API não é acessível publicamente.                  | Escuta apenas em `localhost` ou rede privada.                                                   | Should     |
| RNF-009 | Integridade      | Valores monetários sem erro de arredondamento.                                         | A soma das Parcelas é sempre igual ao valor total; nenhuma operação gera diferença de centavos. | Must       |

## Critérios de aceite

```gherkin
Funcionalidade: Confirmação de lançamentos

  Cenário: Confirmar com adiantamento e Valor Realizado menor
    Dado um lançamento Previsto "Conta de Luz" com Valor Previsto de 120,00 e Data Prevista "10/10/2026"
    Quando eu o confirmo com Valor Realizado de 118,50 e Data Realizada "08/10/2026"
    Então o lançamento passa a Realizado
    E é indicado como adiantado em 2 dias
    E a Variação de Valor é de 1,50 a favor do usuário

  Cenário: Registrar um lançamento já Realizado
    Quando eu registro uma despesa Realizada de 85,00 com Data Realizada "10/10/2026"
    Então o Valor Previsto é 85,00 e a Data Prevista é "10/10/2026"
    E o lançamento é indicado como em dia

  Cenário: Lançamento Previsto vencido
    Dado um lançamento Previsto com Data Prevista "05/10/2026"
    Quando eu consulto em "09/10/2026"
    Então o lançamento é indicado como Vencido
```

```gherkin
Funcionalidade: Saldo Projetado

  Cenário: Projetar o saldo com lançamentos Previstos
    Dado uma conta com Saldo Atual de 1.000,00
    E uma receita Prevista de 500,00 em "20/10/2026"
    E uma despesa Prevista de 200,00 em "25/10/2026"
    Quando eu consulto o Saldo Projetado para "31/10/2026"
    Então o Saldo Projetado é 1.300,00
```

```gherkin
Funcionalidade: Transferência entre contas

  Cenário: Transferir entre contas
    Dado a conta "Conta Corrente" com Saldo Atual de 1.000,00
    E a conta "Investimentos" com Saldo Atual de 500,00
    Quando eu transfiro 300,00 da "Conta Corrente" para "Investimentos"
    Então os Saldos Atuais passam a ser 700,00 e 800,00

  Cenário: Transferência não altera o Resultado
    Dado, na "Conta Corrente", uma receita Realizada de 500,00 e uma despesa Realizada de 200,00 em outubro
    Quando eu transfiro 300,00 para "Investimentos" em outubro
    Então a visão mensal de outubro mostra Resultado de 300,00
    E mostra Transferências enviadas de 300,00
```

```gherkin
Funcionalidade: Parcelamento

  Cenário: Confirmar uma Parcela com Valor Realizado diferente
    Dado um Parcelamento de 203,49 em 3 Parcelas de 67,83
    Quando eu confirmo a Parcela 1 com Valor Realizado de 67,80
    Então as Parcelas 2 e 3 continuam com Valor Previsto de 67,83

  Cenário: Resto dos centavos na primeira Parcela
    Quando eu crio um Parcelamento de 100,00 em 3 Parcelas
    Então as Parcelas têm Valor Previsto de 33,34, 33,33 e 33,33
```

```gherkin
Funcionalidade: Reserva por Mês de Competência

  Cenário: Reservar em setembro uma despesa que vence em outubro
    Dado uma despesa Prevista de 400,00 com Data Prevista "02/10/2026"
    Quando eu informo o Mês de Competência "09/2026"
    Então a despesa entra no planejado de setembro e não no de outubro
    E a visão diária mostra a despesa em "02/10/2026"

  Cenário: Confirmar não muda o Mês de Competência
    Dado a despesa com Mês de Competência "09/2026"
    Quando eu a confirmo com Data Realizada "03/10/2026"
    Então a despesa entra como realizada em setembro
    E a visão diária mostra a saída em "03/10/2026"

  Cenário: Reserva em dezembro para janeiro
    Dado uma despesa com Data Prevista "01/01/2027" e Mês de Competência "12/2026"
    Então a despesa entra na visão anual de 2026, e não na de 2027

  Cenário: Reservar cada Parcela no mês anterior
    Dado um Parcelamento de 3 Parcelas de 100,00, com a primeira Parcela em "02/10/2026"
    Quando eu aplico a competência no mês anterior
    Então as Parcelas vencem em 02/10, 02/11 e 02/12
    E os Meses de Competência são 09/2026, 10/2026 e 11/2026
```

```gherkin
Funcionalidade: Saldo Inicial

  Cenário: Começar a rastrear uma conta que já tem saldo
    Quando eu cadastro uma conta com Saldo Inicial de 1.500,00 e Data de Início "09/10/2026"
    Então o Saldo Atual é 1.500,00
    E o Resultado de outubro continua em 0,00

  Cenário: Saldo Inicial não muda após movimentações
    Dado uma conta com Saldo Inicial de 1.500,00 e uma despesa Realizada
    Quando eu tento alterar o Saldo Inicial
    Então o sistema rejeita a alteração
```

```gherkin
Funcionalidade: Correção de lançamentos

  Cenário: Lançamento Realizado não pode ser editado
    Dado uma despesa Realizada de 120,00
    Quando eu tento alterar o Valor Realizado
    Então o sistema rejeita a alteração

  Cenário: Estornar um lançamento Realizado
    Dado uma despesa Realizada de 120,00 em "08/10/2026"
    Quando eu a estorno em "09/10/2026"
    Então o original permanece com 120,00 em "08/10/2026"
    E o estorno devolve 120,00 ao Saldo Atual em "09/10/2026"
    E as despesas de "09/10/2026" são reduzidas em 120,00

  Cenário: Cancelar um lançamento Previsto
    Dado uma despesa Prevista de 120,00
    Quando eu a cancelo
    Então o Estado passa a Cancelado
    E ela deixa de entrar no Saldo Projetado
```

```gherkin
Funcionalidade: Categoria Padrão

  Cenário: Registrar lançamento sem categoria
    Quando eu registro uma despesa de 50,00 sem informar a categoria
    Então ela é criada na Categoria Padrão do Sistema "Outros" de despesa
```
