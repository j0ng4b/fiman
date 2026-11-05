# Registros de decisão de arquitetura (ADR)

Um ADR por decisão técnica relevante: o que foi decidido e por quê, para não
precisar reconstruir o raciocínio depois.

## Como usar

- Um arquivo por decisão, nomeado `NNNN-titulo.md`. O número é o ID e nunca é
  reutilizado.
- Para criar um novo, copie [`0000-template.md`](0000-template.md).
- Um ADR aceito não é editado. Se a decisão mudar, cria-se outro ADR que o
  substitui, e o antigo passa a `Substituído por ADR-xxxx`.
- Datas no formato `DD-MM-AAAA`.

**Status:** `Proposto`, `Aceito`, `Substituído por ADR-xxxx` ou `Rejeitado`.

## Decisões

|                       ID                        | Título                                                     | Status |    Data    |
| :---------------------------------------------: | ---------------------------------------------------------- | :----: | :--------: |
|            [0001](0001-monorepo.md)             | Monorepo                                                   | Aceito | 17-10-2026 |
|         [0002](0002-banco-de-dados.md)          | Banco de dados: PostgreSQL                                 | Aceito | 17-10-2026 |
| [0003](0003-usuario-padrao-sem-autenticacao.md) | `user_id` em todas as entidades, sem autenticação no MVP   | Aceito | 05-11-2026 |
|         [0004](0004-eixos-de-tempo.md)          | Dois eixos de tempo: data do dinheiro e mês de competência | Aceito | 05-11-2026 |
