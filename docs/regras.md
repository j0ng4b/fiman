# Regras de negócio

- **Status:** Pronto
- **Versão:** 1.3
- **Última atualização:** 17-11-2026

As regras que o sistema sempre cumpre: o que é válido, como se calcula e o que é
proibido. Os termos estão no [glossário](glossario.md); o que o sistema faz, em
[requisitos](requisitos.md).

## Tipos de regra

- **Validação:** diz se um dado informado é aceito. Se não for, a operação é
  rejeitada com mensagem.
- **Cálculo:** diz como um valor é calculado ou derivado de outros.
- **Restrição:** limita o que pode ser feito, conforme o estado do registro ou a
  relação com outros dados.

As regras de comportamento ficam no código, com testes. O banco garante só a
estrutura (ver [modelo-de-dados](modelo-de-dados.md)).

## Como ler

- As regras estão agrupadas pelas mesmas seções dos requisitos.
- Regra que vale para mais de uma seção fica em **Gerais**. Regra de uma seção
  só fica nela.
- Uma regra não cita outra: quando depende de um conceito, usa o termo do
  glossário.
- Os IDs seguem a ordem das seções. Uma regra nova recebe o próximo número livre
  e fica na seção a que pertence, mesmo que o número fique fora de ordem.

---

## Gerais

### RN-001

**Tipo:** Validação

Todo valor monetário informado (valor previsto, valor realizado, valor de
transferência e total de parcelamento) deve ser maior que zero. A única exceção
é o saldo inicial da conta.

### RN-002

**Tipo:** Restrição

Contas e categorias que já têm lançamentos (ou, no caso de contas,
transferências) não podem ser excluídas, apenas inativadas. Sem movimentação,
podem ser excluídas permanentemente.

### RN-003

**Tipo:** Restrição

Contas e categorias inativas não podem ser usadas em novos registros e
permanecem no histórico.

## Contas

### RN-004

**Tipo:** Validação

Cada conta tem saldo inicial (pode ser zero ou negativo) e data de início
(padrão: hoje; não pode ser futura).

### RN-005

**Tipo:** Validação

Lançamentos e transferências da conta não podem ter data anterior à data de
início, nem mês de competência anterior ao mês da data de início, pois o saldo
inicial já contém tudo o que aconteceu antes.

### RN-006

**Tipo:** Restrição

O saldo inicial e a data de início só podem ser alterados enquanto a conta não
tiver nenhum lançamento nem transferência.

## Categorias

### RN-007

**Tipo:** Validação

A categoria de um lançamento deve ter o mesmo tipo (receita ou despesa) que ele.

### RN-008

**Tipo:** Restrição

O tipo de uma categoria não pode ser alterado depois que ela tiver lançamentos.

### RN-009

**Tipo:** Restrição

Todo lançamento tem uma categoria. Se nenhuma for informada, ele recebe a
categoria padrão do seu tipo.

### RN-010

**Tipo:** Restrição

As categorias padrão do sistema não podem ser inativadas, excluídas nem ter o
nome ou o tipo alterados.

## Lançamentos

### RN-011

**Tipo:** Cálculo

O tipo do lançamento define o sinal na soma: receitas somam e despesas subtraem.

### RN-012

**Tipo:** Restrição

Um lançamento pode ser criado como Previsto ou diretamente como Realizado. O
Previsto possui valor previsto e data prevista. O Realizado possui também valor
realizado e data realizada, que não pode ser posterior a hoje.

### RN-013

**Tipo:** Restrição

Só um Previsto pode ser confirmado. A confirmação acrescenta a data realizada
(padrão: hoje) e o valor realizado, sem alterar o valor previsto, a data
prevista, a conta nem o mês de competência.

### RN-014

**Tipo:** Cálculo

Um lançamento criado diretamente como Realizado tem valor previsto igual ao
valor realizado e data prevista igual à data realizada.

### RN-015

**Tipo:** Validação

Todo lançamento possui um mês de competência. Quando não informado, recebe como
padrão o mês da data prevista. O mês de competência não pode ser posterior ao
mês da data prevista. Se for anterior, o lançamento conta naquele mês nas visões
mensal e anual, mesmo vencendo depois. Vale para receitas e despesas.

### RN-016

**Tipo:** Restrição

Enquanto Previsto, ao editar a data prevista: se o mês de competência é o mês da
data prevista, ele passa a ser o mês da nova data; caso contrário, é mantido, e
a edição é rejeitada se ele ficar posterior ao mês da nova data prevista.

### RN-017

**Tipo:** Restrição

Lançamentos Previstos podem ser editados até a confirmação.

### RN-018

**Tipo:** Restrição

Um lançamento Realizado é imutável nos campos financeiros (tipo, conta, valor
previsto, data prevista, valor realizado, data realizada e mês de competência).
Somente descrição e categoria podem ser alteradas, pois não afetam saldos.

### RN-019

**Tipo:** Restrição

Só lançamentos Previstos podem ser cancelados. O estado passa a Cancelado e o
registro é mantido. Lançamentos Realizados não podem ser cancelados.

### RN-020

**Tipo:** Restrição

Um lançamento Cancelado não entra em saldos, projeções nem métricas e não pode
ser alterado.

### RN-021

**Tipo:** Restrição

Um Realizado só é corrigido por estorno: recebe a data do estorno (igual ou
posterior à data realizada) e, a partir dela, o seu efeito é anulado. É a única
alteração permitida além de descrição e categoria, só ocorre uma vez e não pode
ser desfeita.

### RN-022

**Tipo:** Cálculo

Um lançamento Previsto é Vencido quando a sua data prevista é anterior a hoje.

### RN-023

**Tipo:** Cálculo

**Variação de data** = data realizada - data prevista, em dias. Maior que 0:
atrasado; menor que 0: adiantado; igual a 0: em dia.

### RN-024

**Tipo:** Cálculo

**Variação de valor**, a favor do usuário: despesa = valor previsto - valor
realizado; receita = valor realizado - valor previsto. Positiva é favorável. O
**percentual** é a variação de valor ÷ valor previsto × 100.

**Exemplo (variação).** Conta de luz prevista em 120,00 para 10/10, paga com
118,50 em 08/10: adiantada em 2 dias, variação de valor de 1,50 a favor do
usuário (1,25%).

## Parcelamento

### RN-025

**Tipo:** Cálculo

Parcelamento de valor V em N parcelas: as parcelas 2 a N valem V ÷ N, truncado
em centavos, e a primeira absorve o resto (V − (N−1) × valor das demais), de
modo que a soma seja exatamente V.

### RN-026

**Tipo:** Cálculo

As datas das parcelas são mensais e mantêm o dia da primeira parcela (último dia
do mês se o dia não existir).

### RN-027

**Tipo:** Restrição

As parcelas são numeradas de 1 a N. Cada uma é confirmada com valor realizado e
data realizada próprios, sem afetar as demais.

### RN-028

**Tipo:** Restrição

Cancelar o parcelamento cancela só as parcelas Previstas; as Realizadas
permanecem.

### RN-029

**Tipo:** Cálculo

Ao criar um parcelamento com competência no mês anterior, cada parcela recebe
como mês de competência o mês anterior ao mês da sua data prevista (janeiro
volta para dezembro do ano anterior).

Depois de gerada, uma parcela é um lançamento comum: pode ser confirmada,
cancelada ou estornada individualmente, sem alterar o parcelamento nem as outras
parcelas.

**Exemplo (datas).** 100,00 em 3 parcelas: 33,34 + 33,33 + 33,33. Com a primeira
parcela em 31/01, as datas são 31/01, 28/02 e 31/03.

## Transferências

### RN-030

**Tipo:** Validação

Uma transferência exige conta de origem diferente da de destino e uma data.
Altera o saldo das duas contas.

### RN-031

**Tipo:** Restrição

Uma transferência errada é corrigida com uma transferência inversa.

### RN-032

**Tipo:** Validação

A conta de saída deve ter saldo superior ou igual ao valor da transferência para
que a operação seja concluída.

### RN-041

**Tipo:** Restrição

Após criada, uma transferência é imutável nos campos financeiros. Somente a
descrição pode ser alterada.

## Visões e saldos

### RN-033

**Tipo:** Cálculo

**Saldo atual** de uma conta = saldo inicial + receitas Realizadas - despesas
Realizadas (valor realizado, com data realizada até hoje) + transferências
recebidas - transferências enviadas (data até hoje).

### RN-034

**Tipo:** Cálculo

**Saldo projetado** de uma conta na data de consulta = saldo inicial +
lançamentos Realizados com data realizada até a data de consulta + lançamentos
Previstos com data prevista até a data de consulta (receitas +, despesas -) +
transferências com data até a data de consulta. Um Previsto Vencido permanece na
sua data prevista.

### RN-035

**Tipo:** Cálculo

Um Realizado estornado conta normalmente até o dia anterior à data do estorno e
deixa de contar a partir dela, nos saldos e na visão diária.

### RN-036

**Tipo:** Cálculo

**Visão diária:** realizados no dia da data realizada, com o valor realizado;
previstos no dia da data prevista, com o valor previsto.

### RN-037

**Tipo:** Cálculo

**Visões mensal e anual:** lançamentos agrupados pelo mês e ano do mês de
competência, realizados com o valor realizado e previstos com o valor previsto.

### RN-038

**Tipo:** Cálculo

Transferências aparecem em todas as visões, por conta, em colunas próprias
(recebidas e enviadas), pela data da transferência, pois não têm mês de
competência.

### RN-039

**Tipo:** Cálculo

**Saldo acumulado** mensal ou anual = saldo inicial + resultados dos períodos
até o período exibido (pelo mês de competência) + transferências recebidas −
enviadas até o fim do período exibido (pelo mês da data da transferência).
Existe a versão confirmada (só Realizados) e a projetada (Realizados e
Previstos).

### RN-040

**Tipo:** Cálculo

Nas visões mensal e anual, o estorno de um lançamento é exibido no mês e ano da
**data do estorno** (como um lançamento de ajuste que anula o impacto no período
em que o dinheiro retornou), sem alterar retroativamente a exibição do mês de
competência original.

**Exemplo (visão diária e mensal).** Fatura de 400,00, data prevista 02/10/2026,
mês de competência 09/2026.

- **Antes do pagamento**
    - Visão diária: 02/10 — despesa prevista de 400.
    - Visão mensal: setembro — despesa prevista de 400.
- **Paga em 03/10 com 400,00**
    - Visão diária: 03/10 — despesa realizada de 400.
    - Visão mensal: setembro — despesa realizada de 400.
- **Outubro**
    - Visão diária: sem relação com a fatura.
    - Visão mensal: sem a fatura.

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
