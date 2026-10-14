# 01 — Visão e escopo

- **Status:** Revisado
- **Versão:** 0.4
- **Última atualização:** 13-10-2026

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
previsibilidade, que permita registrar lançamentos (receitas e despesas,
previstos ou realizados), visualizar métricas diárias, mensais e anuais,
projetar o saldo e acompanhar a variação entre o previsto e o realizado,
incluindo a reserva de lançamentos em um mês de competência anterior ao
vencimento.

## 3. Objetivos do projeto como portfólio

O projeto serve também para praticar e demonstrar atividades de análise e
desenvolvimento de sistemas:

- **Especificação:** requisitos, regras de negócio e critérios de aceite, em
  documentos enxutos e consistentes entre si.

- **Modelagem:** domínio e dados, partindo de uma linguagem ubíqua compartilhada
  entre documentos, código e banco.

- **Arquitetura e decisões:** monorepo com NestJS e Vue, persistência com
  Drizzle, e decisões de arquitetura registradas em ADRs.

- **Implementação:** fatias verticais ponta a ponta (Vue, NestJS e Drizzle), com
  testes sobre as regras de negócio.

## 4. Stakeholders e usuários

| Papel                  | Descrição                                                    | Interesse                                                                               |
| ---------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Usuário Final (Dono)   | Pessoa física que gerencia as próprias finanças              | Ter clareza sobre o saldo real vs. projetado e controle preciso do histórico financeiro |
| Avaliador / Recrutador | Desenvolvedor ou gestor de engenharia analisando o portfólio | Avaliar a maturidade arquitetural, qualidade de código e organização da documentação    |

## 5. Escopo

### Dentro do escopo (MVP)

- **Gestão de Lançamentos:**
  - Registro de receitas e despesas, previstas ou realizadas, classificadas por
    categoria.

  - Parcelamento: geração automática das parcelas de um lançamento.

  - Acompanhamento da **variação** entre previsto e realizado:
    - **Data:** Data Prevista vs. Data Realizada (adiantamento ou atraso).

    - **Valor:** Valor Previsto vs. Valor Realizado.

  - **Reserva:** um lançamento pode ter Mês de Competência anterior ao mês do
    vencimento. Ele passa a contar no planejamento desse mês e do ano
    correspondente, sem alterar o caixa.

  - **Correção por estorno:** lançamentos realizados não são editados nem
    cancelados; erros se corrigem por estorno, que preserva o histórico.

- **Gestão de Contas, Categorias e Transferências:**
  - Contas, cada uma com saldo inicial e data de início do rastreamento.

  - Categorias de receita e de despesa.

  - Transferência de dinheiro entre contas.

- **Métricas e Projeções:**
  - **Visão diária (eixo de caixa):** o que realmente aconteceu até hoje e,
    daí em diante, o previsto na Data Prevista.

  - **Visões mensal e anual (eixo de competência):** o que pertence a cada
    período, incluindo as reservas.

  - Projeção de saldo com base nos lançamentos previstos.

  - Indicadores visuais de variação e do estado dos lançamentos (previsto,
    realizado, vencido).

### Depois do MVP

- Importação e exportação de lançamentos em CSV.
- Ajuste automático das datas das parcelas para dia útil.

### Fora do escopo (neste ciclo)

- Autenticação e múltiplos usuários (o modelo já prevê `user_id`; no MVP existe
  apenas o usuário padrão).
- Importação automática via Open Finance / OFX / extratos bancários.
- Gestão e cotação de ativos de investimentos em tempo real.
- Notificações por e-mail ou push.
- Bloqueio diário do saldo a partir da reserva (saldo disponível dia a dia).
- Lançamentos recorrentes (ex.: conta de água todo mês).

## 6. Premissas e restrições

| Tipo      | Descrição                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| Premissa  | O uso inicial será estritamente pessoal (Single-User), rodando em ambiente controlado.                                      |
| Premissa  | A modelagem do banco de dados deve prever uma futura migração para suporte a múltiplos usuários sem refatoração destrutiva. |
| Premissa  | A reserva é uma atribuição de competência: não movimenta dinheiro nem altera o saldo em caixa ou a visão diária.            |
| Premissa  | Todos os valores são em reais (BRL), com uma única moeda.                                                                   |
| Restrição | **Stack:** Frontend em Vue.js (com Tailwind CSS), Backend em NestJS e ORM com Drizzle.                                      |

## 7. Riscos

| Risco                                                                  | Probabilidade | Impacto | Mitigação                                                                                                                                                                 |
| ---------------------------------------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escopo crescer além do MVP                                             | Média         | Alto    | Manter a lista "Fora do escopo" estrita e priorizar regras de negócio essenciais.                                                                                         |
| Complexidade na projeção e recalculo de parcelas                       | Média         | Médio   | Modelar explicitamente o ciclo de vida do lançamento desde a camada do banco de dados.                                                                                    |
| Dois eixos de tempo (caixa e competência) gerarem leituras divergentes | Média         | Médio   | Documentar a diferença, nomear os eixos nas telas ("Caixa" e "Competência") e cobrir com testes os casos em que pagamento e competência caem em meses ou anos diferentes. |
| Documentação excessiva                                                 | Média         | Médio   | Documentos mínimos; criar os demais sob demanda, junto de cada fatia de código.                                                                                           |

## 8. Critérios de sucesso

- Conseguir visualizar o saldo projetado do mês atual considerando contas ainda
  não pagas.

- Identificar com facilidade o histórico de atrasos, adiantamentos e variações
  entre o valor planejado e o pago nas parcelas/contas passadas.

- Registrar um novo lançamento ou transferência em menos de 1 minuto.

- Ver, no resultado do mês anterior, as contas que vencem no início do mês
  seguinte já consideradas como reserva.

- Repositório de demonstração contendo ADRs claras e histórico rastreável de
  decisões arquiteturais.
