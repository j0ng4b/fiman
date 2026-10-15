# Documentação — Fiman

Documentação do projeto, escrita de forma incremental: cada documento tem o
mínimo necessário para começar a construir. O que ainda não existe é criado
junto da fatia de código que o exigir.

## Documentos

| #   | Documento                                    | Conteúdo                                                 |
| --- | -------------------------------------------- | -------------------------------------------------------- |
| 00  | [Glossário](00-glossario.md)                 | Linguagem ubíqua: o significado de cada termo do sistema |
| 01  | [Visão e escopo](01-visao.md)                | Problema, objetivo, escopo, stakeholders                 |
| 02  | [Requisitos](02-requisitos.md)               | RF e RNF com prioridade e critérios de aceite            |
| 03  | [Regras de negócio](03-regras-de-negocio.md) | RN-xxx                                                   |
| 05  | [Modelo de domínio](05-modelo-de-dominio.md) | Entidades, relacionamentos e fronteiras de consistência  |
| 06  | [Modelo de dados](06-modelo-de-dados.md)     | DER, tabelas e decisões de modelagem                     |

## Sob demanda

Criados junto de cada fatia de código. A numeração fica reservada para
não renumerar os documentos existentes.

- `04-casos-de-uso/`: UC-xxx
- `07-diagramas/`: sequência, estados, atividades
- `08-prototipos/`: telas (TL-xxx)
- `09-adr/`: decisões de arquitetura, registradas no momento da decisão
- `10-rastreabilidade.md`: requisito → caso de uso → tela → endpoint → teste,
  quando houver artefatos suficientes

## Convenções

**IDs** (nunca reutilizar um ID removido):

| Prefixo    | Artefato                |
| ---------- | ----------------------- |
| `RF-001`   | Requisito funcional     |
| `RNF-001`  | Requisito não funcional |
| `RN-001`   | Regra de negócio        |
| `UC-001`   | Caso de uso             |
| `TL-001`   | Tela / protótipo        |
| `ADR-0001` | Decisão de arquitetura  |

**Status** (cabeçalho de cada documento, que é a única fonte dessa informação):

| Status       | Significado                                                                   |
| ------------ | ----------------------------------------------------------------------------- |
| `Rascunho`   | Em escrita; pode mudar sem aviso e tem pendências conhecidas                  |
| `Revisado`   | Relido e consistente com os documentos de que deriva; pronto para implementar |
| `Verificado` | O sistema construído segue o documento, confirmado por código e testes        |
| `Obsoleto`   | Substituído ou descartado; mantido só para histórico                          |

Um documento só é `Revisado` se os de que deriva já estão `Revisado` ou
`Verificado`. Mudar o significado de um documento devolve-o a `Rascunho`;
corrigir texto, não.

**Prioridade (MoSCoW):** `Must`, `Should`, `Could`, `Won't`.

**Diagramas:** Mermaid em blocos ` ```mermaid `. Renderizam direto no GitHub.

## Princípios

- Uma regra não cita outra regra. Quando depende de um conceito, usa o termo do
  glossário.

- Cada fato mora em um só lugar.

- Os vínculos entre artefatos (requisito, caso de uso, tela, teste) ficam só na
  matriz de rastreabilidade.

## Fluxo de trabalho

Documentar o mínimo → implementar uma fatia vertical → voltar e atualizar o que
a prática mostrou. Se o escopo mudar, atualizar o requisito (`02`) e as regras
(`03`) antes de codificar.
