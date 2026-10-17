# ADR-0002 — Banco de dados: PostgreSQL

- **Status:** Aceito
- **Data:** 17-10-2026

## Contexto

O sistema guarda lançamentos, saldos e transferências e usa Drizzle para acesso
a dados. O modelo depende de restrições no banco (`CHECK`, chave externa
composta e índice único parcial), de valores monetários exatos e de um caminho
para múltiplos usuários.

## Decisão

Usar PostgreSQL. Valores monetários em centavos, como inteiro.

## Alternativas consideradas

- **SQLite:** sem serviço para rodar, mas com tipos e restrições mais fracos e
  sem caminho natural para múltiplos usuários.

## Consequências

- Exige um PostgreSQL em execução em desenvolvimento (por exemplo, em contêiner).
- O Drizzle usa o dialeto `pg`; datas trafegam como texto `AAAA-MM-DD`.
- O inteiro em centavos continua valendo, porque o Drizzle devolve `numeric`
  como texto.
