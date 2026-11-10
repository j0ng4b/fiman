# Regras de negócio

- **Status:** Pronto
- **Versão:** 1.1
- **Última atualização:** 10-11-2026

As regras que o sistema sempre cumpre: o que é válido, como se calcula e o que é
proibido. Os termos estão no [glossário](glossario.md); o que o sistema faz, em
[requisitos](requisitos.md).

## Tipos de regra

| Tipo          | O que é                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------- |
| **Validação** | Diz se um dado informado é aceito. Se não for, a operação é rejeitada com mensagem.       |
| **Cálculo**   | Diz como um valor é calculado ou derivado de outros.                                      |
| **Restrição** | Limita o que pode ser feito, conforme o estado do registro ou a relação com outros dados. |

As regras de comportamento ficam no código, com testes. O banco garante só a
estrutura (ver [modelo-de-dados](modelo-de-dados.md)).

## Como ler

- As regras estão agrupadas pelas mesmas seções dos requisitos.
- Regra que vale para mais de uma seção fica em **Gerais**. Regra de uma seção só
  fica nela.
- Uma regra não cita outra: quando depende de um conceito, usa o termo do
  glossário.
- Os IDs seguem a ordem das seções. Uma regra nova recebe o próximo número livre
  e fica na seção a que pertence, mesmo que o número fique fora de ordem.

---

## Gerais

|   ID   | Regra                                                                                                                                                                                 |   Tipo    |
| :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: |
| RN-001 | Todo valor monetário informado (valor previsto, valor realizado, valor de transferência e total de parcelamento) deve ser maior que zero. A única exceção é o saldo inicial da conta. | Validação |
| RN-002 | Contas e categorias que já têm lançamentos (ou, no caso de contas, transferências) não podem ser excluídas, apenas inativadas. Sem movimentação, podem ser excluídas permanentemente. | Restrição |
| RN-003 | Contas e categorias inativas não podem ser usadas em novos registros e permanecem no histórico.                                                                                       | Restrição |

## Contas

|   ID   | Regra                                                                                                                                                                                                    |   Tipo    |
| :----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: |
| RN-004 | Cada conta tem saldo inicial (pode ser zero ou negativo) e data de início (padrão: hoje; não pode ser futura).                                                                                           | Validação |
| RN-005 | Lançamentos e transferências da conta não podem ter data anterior à data de início, nem mês de competência anterior ao mês da data de início, pois o saldo inicial já contém tudo o que aconteceu antes. | Validação |
| RN-006 | O saldo inicial e a data de início só podem ser alterados enquanto a conta não tiver nenhum lançamento nem transferência.                                                                                | Restrição |

## Categorias

|   ID   | Regra                                                                                                   |   Tipo    |
| :----: | ------------------------------------------------------------------------------------------------------- | :-------: |
| RN-007 | A categoria de um lançamento deve ter o mesmo tipo (receita ou despesa) que ele.                        | Validação |
| RN-008 | O tipo de uma categoria não pode ser alterado depois que ela tiver lançamentos.                         | Restrição |
| RN-009 | Todo lançamento tem uma categoria. Se nenhuma for informada, ele recebe a categoria padrão do seu tipo. | Restrição |
| RN-010 | As categorias padrão do sistema não podem ser inativadas, excluídas nem ter o nome ou o tipo alterados. | Restrição |

## Lançamentos

|   ID   | Regra                                                                                                                                                                                                                                                     |   Tipo    |
| :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: |
| RN-011 | O tipo do lançamento define o sinal na soma: receitas somam e despesas subtraem.                                                                                                                                                                          |  Cálculo  |
| RN-012 | Um lançamento é criado Previsto ou Realizado. O Previsto tem valor previsto e data prevista. O Realizado tem também valor realizado e data realizada, que não pode ser posterior a hoje.                                                                  | Restrição |
| RN-013 | Confirmar um Previsto acrescenta a data realizada e o valor realizado, sem alterar o valor previsto, a data prevista, a conta nem o mês de competência.                                                                                                   | Restrição |
| RN-014 | Um lançamento criado já Realizado tem valor previsto igual ao valor realizado e data prevista igual à data realizada.                                                                                                                                     |  Cálculo  |
| RN-015 | O mês de competência tem como padrão o mês da data prevista e não pode ser posterior a esse mês. Se for anterior, o lançamento conta naquele mês nas visões mensal e anual, mesmo vencendo depois. Vale para receitas e despesas.                         | Validação |
| RN-016 | Enquanto Previsto, ao editar a data prevista: se o mês de competência é o mês da data prevista, ele passa a ser o mês da nova data; caso contrário, é mantido, e a edição é rejeitada se ele ficar posterior ao mês da nova data prevista.                | Restrição |
| RN-017 | Lançamentos Previstos podem ser editados até a confirmação.                                                                                                                                                                                               | Restrição |
| RN-018 | Um lançamento Realizado é imutável nos campos financeiros (tipo, conta, valor previsto, data prevista, valor realizado, data realizada e mês de competência). Somente descrição e categoria podem ser alteradas, pois não afetam saldos.                  | Restrição |
| RN-019 | Só lançamentos Previstos podem ser cancelados. O estado passa a Cancelado e o registro é mantido. Lançamentos Realizados não podem ser cancelados.                                                                                                        | Restrição |
| RN-020 | Um lançamento Cancelado não entra em saldos, projeções nem métricas e não pode ser alterado.                                                                                                                                                              | Restrição |
| RN-021 | Um Realizado só é corrigido por estorno: recebe a data do estorno (igual ou posterior à data realizada) e, a partir dela, o seu efeito é anulado. É a única alteração permitida além de descrição e categoria, só ocorre uma vez e não pode ser desfeita. | Restrição |
| RN-022 | Um lançamento Previsto é Vencido quando a sua data prevista é anterior a hoje.                                                                                                                                                                            |  Cálculo  |
| RN-023 | **Variação de data** = data realizada - data prevista, em dias. Maior que 0: atrasado; menor que 0: adiantado; igual a 0: em dia.                                                                                                                         |  Cálculo  |
| RN-024 | **Variação de valor**, a favor do usuário: despesa = valor previsto - valor realizado; receita = valor realizado - valor previsto. Positiva é favorável. O **percentual** é a variação de valor ÷ valor previsto × 100.                                   |  Cálculo  |

**Exemplo (variação).** Conta de luz prevista em 120,00 para 10/10, paga com
118,50 em 08/10: adiantada em 2 dias, variação de valor de 1,50 a favor do
usuário (1,25%).

## Parcelamento

|   ID   | Regra                                                                                                                                                                                           |   Tipo    |
| :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: |
| RN-025 | Parcelamento de valor V em N parcelas: as parcelas 2 a N valem V ÷ N, truncado em centavos, e a primeira absorve o resto (V − (N−1) × valor das demais), de modo que a soma seja exatamente V.  |  Cálculo  |
| RN-026 | As datas das parcelas são mensais e mantêm o dia da primeira parcela (último dia do mês se o dia não existir).                                                                                  |  Cálculo  |
| RN-027 | As parcelas são numeradas de 1 a N. Cada uma é confirmada com valor realizado e data realizada próprios, sem afetar as demais.                                                                  | Restrição |
| RN-028 | Cancelar o parcelamento cancela só as parcelas Previstas; as Realizadas permanecem.                                                                                                             | Restrição |
| RN-029 | Ao criar um parcelamento com competência no mês anterior, cada parcela recebe como mês de competência o mês anterior ao mês da sua data prevista (janeiro volta para dezembro do ano anterior). |  Cálculo  |

Depois de gerada, uma parcela é um lançamento comum: pode ser confirmada,
cancelada ou estornada individualmente, sem alterar o parcelamento nem as outras
parcelas.

**Exemplo (datas).** 100,00 em 3 parcelas: 33,34 + 33,33 + 33,33. Com a primeira
parcela em 31/01, as datas são 31/01, 28/02 e 31/03.

## Transferências

|   ID   | Regra                                                                                                           |   Tipo    |
| :----: | --------------------------------------------------------------------------------------------------------------- | :-------: |
| RN-030 | Uma transferência exige conta de origem diferente da de destino e uma data. Altera o saldo das duas contas.     | Validação |
| RN-031 | Uma transferência errada é corrigida com uma transferência inversa.                                             | Restrição |
| RN-032 | A conta de saída deve ter saldo superior ou igual ao valor da transferência para que a operação seja concluída. | Validação |

## Visões e saldos

|   ID   | Regra                                                                                                                                                                                                                                                                                                                                   |  Tipo   |
| :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| RN-033 | **Saldo atual** de uma conta = saldo inicial + receitas Realizadas - despesas Realizadas (valor realizado, com data realizada até hoje) + transferências recebidas - transferências enviadas (data até hoje).                                                                                                                           | Cálculo |
| RN-034 | **Saldo projetado** de uma conta na data de consulta = saldo inicial + lançamentos Realizados com data realizada até a data de consulta + lançamentos Previstos com data prevista até a data de consulta (receitas +, despesas -) + transferências com data até a data de consulta. Um Previsto Vencido permanece na sua data prevista. | Cálculo |
| RN-035 | Um Realizado estornado conta normalmente até o dia anterior à data do estorno e deixa de contar a partir dela, nos saldos e na visão diária.                                                                                                                                                                                            | Cálculo |
| RN-036 | **Visão diária:** realizados no dia da data realizada, com o valor realizado; previstos no dia da data prevista, com o valor previsto.                                                                                                                                                                                                  | Cálculo |
| RN-037 | **Visões mensal e anual:** lançamentos agrupados pelo mês e ano do mês de competência, realizados com o valor realizado e previstos com o valor previsto.                                                                                                                                                                               | Cálculo |
| RN-038 | Transferências aparecem em todas as visões, por conta, em colunas próprias (recebidas e enviadas), pela data da transferência, pois não têm mês de competência.                                                                                                                                                                         | Cálculo |
| RN-039 | **Saldo acumulado** mensal ou anual = saldo inicial + resultados dos períodos até o período exibido (pelo mês de competência) + transferências recebidas − enviadas até o fim do período exibido (pelo mês da data da transferência). Existe a versão confirmada (só Realizados) e a projetada (Realizados e Previstos).                | Cálculo |
| RN-040 | Nas visões mensal e anual, o estorno de um lançamento é exibido no mês e ano da **data do estorno** (como um lançamento de ajuste que anula o impacto no período em que o dinheiro retornou), sem alterar retroativamente a exibição do mês de competência original.                                                                    | Cálculo |

**Exemplo (visão diária e mensal).** Fatura de 400,00, data prevista 02/10/2026,
mês de competência 09/2026.

| Momento                  | Visão diária                    | Visão mensal                       |
| ------------------------ | ------------------------------- | ---------------------------------- |
| Antes do pagamento       | 02/10: despesa prevista de 400  | Setembro: despesa prevista de 400  |
| Paga em 03/10 com 400,00 | 03/10: despesa realizada de 400 | Setembro: despesa realizada de 400 |
| Outubro                  | Sem relação com a fatura        | Sem a fatura                       |

## Depois do MVP

Decisões já tomadas, registradas aqui para não se perderem. Viram regras
numeradas quando os requisitos correspondentes entrarem no escopo.

- **Importação CSV:** categoria informada que não existe para o tipo do
  lançamento, ou que está inativa, rejeita a linha, que é listada; nenhuma
  categoria é atribuída automaticamente. Linhas com data anterior à data de
  início também são rejeitadas.

- **Ajuste para dia útil:** a data de cada parcela parte do dia da primeira
  parcela, sem encadear ajustes. Se cair em sábado, domingo ou feriado nacional,
  a data prevista vai para o primeiro dia útil seguinte. O mês de competência
  padrão e o "mês anterior" usam a data antes do ajuste. Datas alteradas pelo
  usuário não são reajustadas.
