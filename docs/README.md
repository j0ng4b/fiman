# Documentação - Fiman

Documentação do projeto, escrita de forma incremental: cada documento tem o
mínimo necessário para começar a construir. O que ainda não existe é criado
junto da fatia de código que o exigir.

## Documentos

| Doc                                    | Conteúdo                                             |
| -------------------------------------- | ---------------------------------------------------- |
| [Glossário](glossario.md)              | O que cada termo significa e como se chama no código |
| [Visão](visao.md)                      | Problema, objetivo e escopo                          |
| [Requisitos](requisitos.md)            | O que o sistema deve fazer (RF) e qualidades (RNF)   |
| [Regras](regras.md)                    | Regras de negócio e fórmulas de cálculo (RN)         |
| [Modelo de dados](modelo-de-dados.md)  | Tabelas, colunas e restrições do banco               |
| [Decisões técnicas](adr/README.md)     | Decisões técnicas, um arquivo por decisão            |
| [Casos de uso](casos-de-uso/README.md) | Casos de uso do sistema (criado sob demanda)         |
| [Protótipos](prototipos/README.md)     | Protótipos do sistema (criado sob demanda)           |

## Convenções

**IDs** (nunca reutilizar um ID removido):

| Prefixo    | O que é                 |
| ---------- | ----------------------- |
| `RF-001`   | Requisito funcional     |
| `RNF-001`  | Requisito não funcional |
| `RN-001`   | Regra de negócio        |
| `ADR-0001` | Decisão técnica         |

**Status** (no cabeçalho de cada documento):

- `Rascunho`: em escrita, pode mudar.
- `Pronto`: revisado e consistente com os outros; pode implementar.

**Prioridade:** `Must`, `Should` e `Could` entram no MVP; `Won't` fica para depois.

**Diagramas:** Mermaid em blocos ` ```mermaid `, que o GitHub renderiza.

## Princípios

- **Um nome por conceito.** O termo do glossário é o que se usa nos docs, e o
  nome da coluna é o que se usa no código.
- **Cada fato mora em um só lugar.** Fórmulas ficam em `regras`, estrutura
  do banco em `modelo-de-dados`. Os outros docs apontam para lá em vez de
  copiar.
- **Regra curta e testável.** Se não dá para escrever um teste para ela, ela
  está vaga.

## Fluxo de trabalho

Documentar > implementar uma fatia (tela, API e banco) > voltar e atualizar o que a prática mostrou. Se o escopo mudar, atualizar `requisitos` e `regras` antes de codar.
