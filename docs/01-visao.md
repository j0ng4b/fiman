# 01 — Visão e escopo

- **Status:** Rascunho
- **Versão:** 0.1
- **Última atualização:** 07-10-2026

## 1. Problema

Dificuldade em gerenciar finanças pessoais de forma unificada e preditiva. As soluções comerciais atuais costumam ser poluídas com funcionalidades excessivas ou rígidas demais para acompanhar o ciclo real das contas (planejado vs. realizado, variações de centavos/juros entre o valor previsto e o pago, divergência de datas de pagamento/recebimento e transferências entre contas/investimentos).

## 2. Objetivo

Desenvolver um sistema de gestão financeira pessoal leve e focado em previsibilidade, permitindo registrar movimentações financeiras e visualizar métricas (diárias, mensais e anuais) e projeções com divergência de datas e valores (previsto vs. realizado).

## 3. Objetivos de aprendizado (portfólio)

- **Engenharia de Requisitos & Modelagem:** Levantamento detalhado de requisitos, mapeamento de processos financeiros pessoais e rastreabilidade.
- **Arquitetura & Decisões Técnico-Estratégicas:** Estruturação de Monorepo com NestJS (backend) e Vue.js (frontend), com persistência e schema-as-code via Drizzle ORM.
- **Documentação de Sistema:** Registro de Architecture Decision Records (ADRs) para escolhas de modelagem de parcelamentos e ciclo de vida de lançamentos.

## 4. Stakeholders e usuários

| Papel                  | Descrição                                                        | Interesse                                                                               |
| ---------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Usuário Final (Dono)   | Pessoa física que gerencia o próprio patrimônio e fluxo de caixa | Ter clareza sobre o saldo real vs. projetado e controle preciso do histórico financeiro |
| Avaliador / Recrutador | Desenvolvedor ou gestor de engenharia analisando o portfólio     | Avaliar a maturidade arquitetural, qualidade de código e organização da documentação    |

## 5. Escopo

### Dentro do escopo (MVP)

- **Gestão de Lançamentos:**
  - Registro de receitas e despesas (confirmadas/efetivadas e planejadas/não confirmadas).
  - Lançamento de despesas parceladas (geração automática de parcelas com vínculo).
  - Controle duplo de execução:
    - **Datas:** data de vencimento/planejada vs. data efetiva de pagamento/recebimento (identificando adiantamentos e atrasos).
    - **Valores:** valor previsto/planejado vs. valor efetivamente pago/recebido (acomodando variações de centavos, arredondamentos ou juros/descontos).
- **Gestão de Contas e Transferências:**
  - Cadastro de múltiplas contas (ex.: Conta Corrente, Investimentos, Reserva).
  - Movimentação/transferência de valores entre contas internas.
- **Métricas e Projeções:**
  - Visualização de painel com métricas diárias, mensais e anuais.
  - Projeção financeira baseada em lançamentos previstos.
  - Indicadores visuais de divergência de valor e status de pagamento.
- **Importação Exportação de dados:**
  - Importar dados de receitas e despesas em outros formatos de arquivos (CSV).
  - Exportar dados para o formato CSV.

### Fora do escopo (neste ciclo)

- Autenticação e suporte a múltiplos usuários (multi-tenant).
- Importação automática via Open Finance / OFX / extratos bancários.
- Gestão e cotação de ativos de investimentos em tempo real.
- Notificações por e-mail ou push.

## 6. Premissas e restrições

| Tipo      | Descrição                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| Premissa  | O uso inicial será estritamente pessoal (Single-User), rodando em ambiente controlado.                                      |
| Premissa  | A modelagem do banco de dados deve prever uma futura migração para suporte a múltiplos usuários sem refatoração destrutiva. |
| Restrição | **Stack:** Frontend em Vue.js (com Tailwind CSS), Backend em NestJS e ORM com Drizzle.                                      |

## 7. Riscos

| Risco                                            | Probabilidade | Impacto | Mitigação                                                                                                                                                  |
| ------------------------------------------------ | ------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escopo crescer além do MVP                       | Média         | Alto    | Manter a lista "Fora do escopo" estrita e priorizar regras de negócio essenciais.                                                                          |
| Complexidade na projeção e recalculo de parcelas | Média         | Médio   | Modelar explicitamente o ciclo de vida do lançamento (`valor_previsto`, `valor_pago`, `data_prevista`, `data_pagamento`) desde a camada do banco de dados. |

## 8. Critérios de sucesso

- Conseguir visualizar o saldo projetado do mês atual considerando contas ainda não pagas.
- Identificar com facilidade o histórico de atrasos, adiantamentos e variações entre o valor planejado e o pago nas parcelas/contas passadas.
- Registrar uma nova movimentação ou transferência em menos de 1 minuto.
- Repositório de demonstração contendo ADRs claras e histórico rastreável de decisões arquiteturais.
