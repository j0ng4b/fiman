# ADR-0004 — Dois eixos de tempo: data do dinheiro e mês de competência

- **Status:** Aceito
- **Data:** 05-11-2026

## Contexto

Algumas contas vencem antes da próxima receita (ex.: fatura de cartão em 02/MM e
receita em 05/MM), então o dinheiro precisa ser separado no mês anterior. O
planejamento mensal e anual precisa refletir isso, sem falsear o acompanhamento
do que realmente acontece dia a dia.

## Decisão

Adotar dois eixos de tempo:

1. **Data do dinheiro (visão diária):** o lançamento aparece em
   `transaction_date` (Realizado) ou em `due_date` (Previsto). O mês de
   competência é ignorado.
2. **Mês de competência (visões mensal e anual):** o lançamento é agrupado por
   `accounting_month`, que:
    - é sempre o dia 01 de um mês;
    - tem como padrão o mês de `due_date`;
    - deve ser igual ou anterior ao mês de `due_date` (`CHECK`);
    - não muda quando o lançamento é pago.

Reservar uma despesa em um mês anterior é, portanto, só ter um mês de
competência anterior ao vencimento. Isso pode cruzar o ano (competência em
dezembro para pagamento em janeiro).

## Alternativas consideradas

| Alternativa                                 | Prós                        | Contras                                                                       |
| ------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| Data de reserva diária com saldo disponível | Mostra o bloqueio dia a dia | Duas visões de saldo, mais regras e telas; não era uma necessidade do usuário |
| Antecipar `due_date`                        | Nenhuma coluna nova         | Perde a data de vencimento real e a análise de atraso e adiantamento          |
| Lançamento duplicado de reserva             | Simples de entender         | Dupla contagem e risco de inconsistência                                      |

## Consequências

- **Positivas:** simples (uma coluna), sem efeito sobre o caixa.
- **Negativas / custos:** o saldo acumulado mensal pode diferir do saldo da conta
  na mesma data. É esperado e deve estar rotulado na interface.
- **Riscos:** confusão entre os dois eixos. Mitigado por nomes claros nas telas
  ("Caixa" e "Competência") e por testes em que pagamento e competência caem em
  meses ou anos diferentes.
