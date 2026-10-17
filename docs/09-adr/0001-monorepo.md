# ADR-0001 — Monorepo

- **Status:** Aceito
- **Data:** 17-10-2026

## Contexto

O projeto tem `api`, `web` e `docs`, é desenvolvido por uma pessoa e serve
também como portfólio. É desejável mostrar a ligação entre documentação e código
em um único lugar.

## Decisão

Usar um único repositório (monorepo).

## Alternativas consideradas

| Alternativa               | Prós                         | Contras                                                                    |
| ------------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| Repositório por pasta     | Isolamento, CI independente  | Três links no portfólio, difícil rastrear docs <> código, tipos duplicados |
| Monorepo com Nx/Turborepo | Cache de build, orquestração | Complexidade desnecessária para o tamanho atual                            |

## Consequências

- **Positivas:** um link, commits atômicos entre front/back/docs.
- **Negativas:** CI precisa filtrar por pasta.
- **Riscos:** nenhum relevante no tamanho atual.
