# 01 — Visão e escopo

- **Status:** Rascunho
- **Versão:** 0.2
- **Última atualização:** 09-10-2026

## 1. Problema

Dificuldade em gerenciar finanças pessoais de forma unificada e preditiva. As
soluções comerciais atuais costumam ser poluídas com funcionalidades excessivas
ou rígidas demais para acompanhar o ciclo real das contas (planejado vs.
realizado, variações entre valor previsto e o pago, divergência de datas de
pagamento/recebimento e transferência entre contas).

Além disso, há contas que vencem **antes** da próxima receita entrar. Para
pagá-las, o dinheiro precisa ser separado no mês anterior, mas as ferramentas
tratam a despesa apenas no mês do vencimento, o que distorce o planejamento
mensal e anual.

## 2. Objetivo

Desenvolver um sistema de gestão financeira pessoal leve e focado em
previsibilidade, permitindo registrar movimentações financeiras e visualizar
métricas (diárias, mensais e anuais) e projeções com divergência de datas e
valores (previsto vs. realizado), incluindo a **reserva de despesas em um mês de
competência anterior ao vencimento**.

## 3. Objetivos de aprendizado (portfólio)

- **Engenharia de Requisitos & Modelagem:** Levantamento detalhado de
  requisitos, mapeamento de processos financeiros pessoais e rastreabilidade.

- **Arquitetura & Decisões Técnico-Estratégicas:** Estruturação de Monorepo com
  NestJS e Vue.js, com persistência via Drizzle ORM.

- **Documentação de Sistema:** Registro de Architecture Decision Records (ADRs)
  para escolhas de modelagem de parcelamentos, eixos de tempo (caixa e
  competência) e ciclo de vida de lançamentos.

## 4. Stakeholders e usuários

| Papel                  | Descrição                                                    | Interesse                                                                               |
| ---------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Usuário Final (Dono)   | Pessoa física que gerencia as próprias finanças              | Ter clareza sobre o saldo real vs. projetado e controle preciso do histórico financeiro |
| Avaliador / Recrutador | Desenvolvedor ou gestor de engenharia analisando o portfólio | Avaliar a maturidade arquitetural, qualidade de código e organização da documentação    |

## 5. Escopo

### Dentro do escopo (MVP)

- **Gestão de Lançamentos:**
  - Registro de receitas e despesas (efetivadas/confirmadas e planejadas/não
    confirmadas).

  - Lançamento de despesas parceladas (geração automática de parcelas com
    vínculo).

  - Controle duplo de execução:
    - **Datas:** data de vencimento/planejada vs. data efetiva de
      pagamento/recebimento (identificando adiantamentos e atrasos).

    - **Valores:**
      valor previsto/planejado vs. valor efetivamente pago/recebido.

  - **Reserva por mês de competência:** um lançamento pode ser atribuído a um
    mês de competência anterior ao do vencimento. Esse mês, e o ano
    correspondente, passam a contar o lançamento nas métricas mensais e anuais,
    previstas e realizadas. O mês de competência não muda após o pagamento.

- **Gestão de Contas e Transferências:**
  - Cadastro de múltiplas contas.

  - Movimentação/transferência de valores entre contas internas.

- **Métricas e Projeções:**
  - **Visão diária (eixo de caixa):** acompanha o que realmente aconteceu até
    hoje e projeta o futuro pela data prevista. Ignora o mês de competência.

  - **Visões mensal e anual (eixo de competência):** consolidam o que pertence
    ao período, incluindo as reservas.

  - Projeção financeira baseada em lançamentos previstos.

  - Indicadores visuais de divergência de valor e status de pagamento.

- **Importação e Exportação de dados:**
  - Importar dados de receitas e despesas em outros formatos de arquivos (CSV).

  - Exportar dados para outros formatos de arquivos (CSV).

### Fora do escopo (neste ciclo)

- Autenticação e suporte a múltiplos usuários (multi-tenant).

- Importação automática via Open Finance / OFX / extratos bancários.

- Gestão e cotação de ativos de investimentos em tempo real.

- Notificações por e-mail ou push.

- Bloqueio diário do saldo a partir da reserva (saldo disponível dia a dia).

## 6. Premissas e restrições

| Tipo      | Descrição                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| Premissa  | O uso inicial será estritamente pessoal (Single-User), rodando em ambiente controlado.                                      |
| Premissa  | A modelagem do banco de dados deve prever uma futura migração para suporte a múltiplos usuários sem refatoração destrutiva. |
| Premissa  | A reserva é uma atribuição de competência: não movimenta dinheiro nem altera o saldo em caixa ou a visão diária.            |
| Restrição | **Stack:** Frontend em Vue.js (com Tailwind CSS), Backend em NestJS e ORM com Drizzle.                                      |

## 7. Riscos

| Risco                                                                  | Probabilidade | Impacto | Mitigação                                                                                                                                                                 |
| ---------------------------------------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escopo crescer além do MVP                                             | Média         | Alto    | Manter a lista "Fora do escopo" estrita e priorizar regras de negócio essenciais.                                                                                         |
| Complexidade na projeção e recalculo de parcelas                       | Média         | Médio   | Modelar explicitamente o ciclo de vida do lançamento desde a camada do banco de dados.                                                                                    |
| Dois eixos de tempo (caixa e competência) gerarem leituras divergentes | Média         | Médio   | Documentar a diferença, nomear os eixos nas telas ("Caixa" e "Competência") e cobrir com testes os casos em que pagamento e competência caem em meses ou anos diferentes. |

## 8. Critérios de sucesso

- Conseguir visualizar o saldo projetado do mês atual considerando contas ainda
  não pagas.

- Identificar com facilidade o histórico de atrasos, adiantamentos e variações
  entre o valor planejado e o pago nas parcelas/contas passadas.

- Registrar uma nova movimentação ou transferência em menos de 1 minuto.

- Ver, no resultado do mês anterior, as contas que vencem no início do mês
  seguinte já consideradas como reserva.

- Repositório de demonstração contendo ADRs claras e histórico rastreável de
  decisões arquiteturais.
