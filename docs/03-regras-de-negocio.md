# 03 — Regras de negócio

- **Status:** Revisado
- **Versão:** 0.4
- **Última atualização:** 16-10-2026

## Regras

| ID     | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Tipo      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| RN-001 | O Valor Previsto e o Valor Realizado devem ser maiores que zero. O tipo do lançamento (receita ou despesa) define o sinal na soma.                                                                                                                                                                                                                                                                                                                                                    | Validação |
| RN-002 | **Saldo Atual** de uma conta = Saldo Inicial + receitas Realizadas − despesas Realizadas (Valor Realizado, com Data Realizada até Hoje) + Transferências recebidas − Transferências enviadas (data até Hoje).                                                                                                                                                                                                                                                                         | Cálculo   |
| RN-003 | **Saldo Projetado** de uma conta na Data de Consulta = Saldo Inicial + lançamentos Realizados com Data Realizada até a Data de Consulta + lançamentos Previstos com Data Prevista até a Data de Consulta (receitas +, despesas −) + Transferências com data até a Data de Consulta. Um Previsto Vencido permanece na sua Data Prevista.                                                                                                                                               | Cálculo   |
| RN-004 | Um lançamento é criado Previsto ou Realizado. O Previsto tem Valor Previsto e Data Prevista. O Realizado tem também Valor Realizado e Data Realizada, que não pode ser posterior a Hoje. Confirmar um Previsto acrescenta a Data Realizada e o Valor Realizado, sem alterar o Valor Previsto, a Data Prevista, a conta nem o Mês de Competência.                                                                                                                                      | Restrição |
| RN-005 | Um lançamento criado já Realizado tem Valor Previsto igual ao Valor Realizado e Data Prevista igual à Data Realizada.                                                                                                                                                                                                                                                                                                                                                                 | Cálculo   |
| RN-006 | **Variação de Data** = Data Realizada − Data Prevista, em dias. Maior que 0: atrasado; menor que 0: adiantado; igual a 0: em dia.                                                                                                                                                                                                                                                                                                                                                     | Cálculo   |
| RN-007 | **Variação de Valor**, a favor do usuário: despesa = Valor Previsto − Valor Realizado; receita = Valor Realizado − Valor Previsto. Positiva é favorável. A **variação percentual** é a Variação de Valor ÷ Valor Previsto × 100.                                                                                                                                                                                                                                                      | Cálculo   |
| RN-008 | Um lançamento Previsto é **Vencido** quando a sua Data Prevista é anterior a Hoje.                                                                                                                                                                                                                                                                                                                                                                                                    | Cálculo   |
| RN-009 | A categoria de um lançamento deve ter o mesmo tipo (receita ou despesa). O tipo de uma categoria não pode ser alterado depois que ela tiver lançamentos.                                                                                                                                                                                                                                                                                                                              | Validação |
| RN-010 | Contas e categorias com lançamentos não podem ser excluídas, apenas inativadas. Contas e categorias sem lançamentos podem ser excluídas permanentemente. Itens inativos não podem ser usados em novos registros e permanecem no histórico.                                                                                                                                                                                                                                            | Restrição |
| RN-011 | Uma Transferência exige conta de origem diferente da de destino, valor maior que zero e data. Altera o saldo das duas contas.                                                                                                                                                                                                                                                                                                                                                         | Validação |
| RN-012 | **Parcelamento** de valor V em N Parcelas: as Parcelas 2 a N valem V ÷ N, truncado em centavos, e a primeira absorve o resto (V − (N−1) × o valor das demais), de modo que a soma seja exatamente V. As datas são mensais, mantendo o dia da primeira Parcela (último dia do mês se o dia não existir).                                                                                                                                                                               | Cálculo   |
| RN-013 | As Parcelas são numeradas de 1 a N e cada uma é confirmada com Valor Realizado e Data Realizada próprios, sem afetar as demais. Cancelar o Parcelamento cancela só as Parcelas Previstas; as Realizadas permanecem.                                                                                                                                                                                                                                                                   | Restrição |
| RN-014 | **Eixos das visões.** _Diária:_ realizados no dia da Data Realizada, com o Valor Realizado; previstos no dia da Data Prevista, com o Valor Previsto. _Mensal e anual:_ lançamentos agrupados pelo mês e ano do Mês de Competência, realizados com o Valor Realizado e previstos com o Valor Previsto. Transferências aparecem em todas as visões, por conta, em colunas próprias (recebidas e enviadas), pelo eixo de caixa (data da Transferência), pois não têm Mês de Competência. | Cálculo   |
| RN-015 | **Mês de Competência.** O padrão é o mês da Data Prevista, e ele não pode ser posterior a esse mês. Se for anterior, o lançamento é uma Reserva naquele mês. Vale para receitas e despesas.                                                                                                                                                                                                                                                                                           | Validação |
| RN-016 | **Cancelar** só é permitido para lançamentos Previstos: o Estado passa a Cancelado e o registro é mantido. Um Cancelado não entra em saldos, projeções nem métricas e não pode ser alterado. Lançamentos Realizados não podem ser cancelados.                                                                                                                                                                                                                                         | Restrição |
| RN-017 | Um lançamento **Realizado** é imutável nos campos financeiros (tipo, conta, Valor Previsto, Data Prevista, Valor Realizado, Data Realizada e Mês de Competência). Somente descrição e categoria podem ser alteradas, pois não afetam saldos. Lançamentos Previstos podem ser editados até a confirmação.                                                                                                                                                                              | Restrição |
| RN-018 | Ao criar um Parcelamento com competência no mês anterior, cada Parcela recebe como Mês de Competência o mês anterior ao mês da sua Data Prevista (janeiro volta para dezembro do ano anterior).                                                                                                                                                                                                                                                                                       | Cálculo   |
| RN-019 | **Saldo Acumulado** mensal ou anual = Saldo Inicial + resultados dos períodos até o período exibido (pelo Mês de Competência) + Transferências recebidas − enviadas até o fim do período exibido (pelo mês da data da Transferência). Existem a versão confirmada (só Realizados) e a projetada (Realizados e Previstos).                                                                                                                                                             | Cálculo   |
| RN-020 | Enquanto o Lançamento está Previsto, ao editar a Data Prevista: se o Mês de Competência é o mês da Data Prevista (sem Reserva), ele passa a ser mês da nova Data Prevista; caso contrário (há Reserva), é mantido, e a edição é rejeitada se ele ficar posterior ao mês da nova Data Prevista.                                                                                                                                                                                        | Restrição |
| RN-021 | **Saldo Inicial e Data de Início.** Cada conta tem Saldo Inicial (pode ser zero ou negativo) e Data de Início (padrão: Hoje; não pode ser futura). Lançamentos e Transferências da conta não podem ter data anterior à Data de Início, nem Mês de Competência anterior ao mês da Data de Início, pois o Saldo Inicial já contém tudo o que aconteceu antes.                                                                                                                           | Validação |
| RN-022 | O Saldo Inicial e a Data de Início só podem ser alterados enquanto a conta não tiver nenhum lançamento Realizado nem Transferência.                                                                                                                                                                                                                                                                                                                                                   | Restrição |
| RN-023 | **Estorno.** Um lançamento Realizado só é corrigido por Estorno: ele recebe a Data do Estorno (igual ou posterior à Data Realizada) e, a partir dela, o seu efeito é anulado em saldos e métricas. É a única alteração permitida em um Realizado além da categoria, só ocorre uma vez e não pode ser desfeita. Uma Transferência errada é corrigida com uma Transferência inversa.                                                                                                    | Restrição |
| RN-024 | **Categoria padrão.** Todo lançamento tem uma categoria. Se nenhuma for informada, ele recebe a Categoria Padrão do Sistema do seu tipo. As Categorias do Sistema não podem ser inativadas, excluídas nem ter o nome ou o tipo alterados.                                                                                                                                                                                                                                             | Restrição |

## Exemplos

**Eixos.** Fatura de 400,00, Data Prevista 02/10/2026, Mês de Competência
09/2026.

| Momento                  | Visão diária                    | Visão mensal                       |
| ------------------------ | ------------------------------- | ---------------------------------- |
| Antes do pagamento       | 02/10: despesa prevista de 400  | Setembro: despesa prevista de 400  |
| Paga em 03/10 com 400,00 | 03/10: despesa realizada de 400 | Setembro: despesa realizada de 400 |
| Outubro                  | Sem relação com a fatura        | Sem a fatura                       |

**Reserva no fim do ano.** Despesa com Data Prevista 01/01/2027 e Mês de
Competência 12/2026 entra na visão anual de 2026.

**Variação.** Conta de luz prevista em 120,00 para 10/10, paga com 118,50 em
08/10: adiantada em 2 dias, com Variação de Valor de 1,50 a favor do usuário
(1,25%).

**Parcelamento.** 100,00 em 3 Parcelas: 33,34 + 33,33 + 33,33. Com a primeira
Parcela em 31/01, as datas são 31/01, 28/02 e 31/03.

**Estorno.** Despesa Realizada de 120,00 em 08/10, lançada com valor errado e
estornada em 09/10: o dia 08/10 continua mostrando a despesa de 120,00; em 09/10
o efeito é anulado, devolvendo 120,00 ao saldo e reduzindo as despesas do dia.

## Decisões para depois do MVP

Registradas aqui para não se perderem. Viram regras quando os requisitos
correspondentes entrarem no escopo.

- **Importação CSV:** categoria informada que não existe para o tipo do
  lançamento, ou que está inativa, rejeita a linha, que é listada; nenhuma
  categoria é atribuída automaticamente. Linhas com data anterior à Data de
  Início também são rejeitadas.

- **Ajuste para dia útil:** a data de cada Parcela parte do dia da primeira
  Parcela, sem encadear ajustes; se cair em sábado, domingo ou feriado nacional,
  a Data Prevista vai para o primeiro dia útil seguinte. O Mês de Competência
  padrão e o "mês anterior" usam a data antes do ajuste. Datas alteradas pelo
  usuário não são reajustadas.
