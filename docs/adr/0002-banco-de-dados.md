# ADR-0002 — Banco de dados: PostgreSQL

- **Status:** Aceito
- **Data:** 17-10-2026

## Contexto

O sistema guarda lançamentos, saldos e transferências e usa Drizzle para acesso
a dados. O modelo depende de restrições no banco (`CHECK`, chave externa
composta, enums nativos), de valores monetários exatos e de um caminho para
múltiplos usuários.

## Decisão

Usar PostgreSQL. Valores monetários em centavos, como inteiro.

## Alternativas consideradas

| Alternativa | Prós                   | Contras                                                                     |
| ----------- | ---------------------- | --------------------------------------------------------------------------- |
| SQLite      | Sem serviço para rodar | Tipos e restrições mais fracos; sem caminho natural para múltiplos usuários |

## Consequências

- **Positivas:** restrições e tipos fortes no próprio banco; caminho natural para
  múltiplos usuários.
- **Negativas / custos:** exige um PostgreSQL em execução em desenvolvimento (por
  exemplo, em contêiner).
- **Riscos:** o Drizzle devolve `numeric` como texto, por isso o dinheiro fica em
  inteiro (centavos). Datas trafegam como texto `AAAA-MM-DD`.
