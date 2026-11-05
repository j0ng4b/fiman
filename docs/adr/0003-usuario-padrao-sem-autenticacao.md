# ADR-0003 — `user_id` em todas as entidades, sem autenticação no MVP

- **Status:** Aceito
- **Data:** 05-11-2026

## Contexto

O sistema é de uso pessoal. Autenticação e múltiplos usuários adicionam telas,
regras e riscos que não entregam valor ao MVP. Porém é exigido que o modelo já
esteja preparado para múltiplos usuários, sem refatoração destrutiva.

## Decisão

- Criar a tabela `users` com um usuário padrão (`id = 1`).
- Incluir `user_id NOT NULL DEFAULT 1` em todas as entidades de negócio (contas,
  categorias, parcelamentos, lançamentos e transferências).
- Não implementar login nem sessão no MVP. A camada de acesso a dados já filtra
  por `user_id`, mesmo que o valor seja sempre o padrão.
- A API não fica acessível publicamente enquanto não houver autenticação.

## Alternativas consideradas

| Alternativa                    | Prós                     | Contras                                 |
| ------------------------------ | ------------------------ | --------------------------------------- |
| Sem `user_id` no MVP           | Modelo mais simples      | Migração destrutiva depois              |
| Autenticação completa desde já | Pronto para multiusuário | Telas e segurança fora do escopo do MVP |

## Consequências

- **Positivas:** adicionar login no futuro não altera o schema nem as regras de
  negócio.
- **Negativas / custos:** toda consulta e escrita precisa considerar `user_id`
  desde o início.
- **Riscos:** acesso indevido se a API for exposta.
