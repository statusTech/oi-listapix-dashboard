# Product

## Register

product

## Users
Usuário master (super-admin) da plataforma Oi Tickets, uma das 2 pessoas na allowlist de acesso. Contexto: checagem periódica de saúde financeira dos clientes (tenants) com Lista Pix ativo — não é uma tarefa de investigação profunda nem de ação corretiva, é leitura rápida de números pra saber se algo está fora do esperado (evento sem split configurado corretamente, cliente sem vendas, etc.). Sessão típica: abrir, escanear, sair. Ferramenta somente leitura, sem fluxo de edição.

## Product Purpose
Dashboard interno que agrega, por cliente, os dados de eventos ativos, total vendido, total de taxas e status de split — mais um resumo geral da operação. Existe pra dar visibilidade rápida sem precisar consultar banco de dados ou o painel admin operacional. Sucesso = super-admin identifica em segundos se um número está errado ou fora do padrão.

## Brand Personality
Confiável, direto, sóbrio. É ferramenta de auditoria financeira interna — precisão e clareza dos números vêm antes de qualquer personalidade visual. Sem elementos decorativos que compitam com o dado.

## Anti-references
Nada que pareça dashboard de SaaS de vendas/marketing (hero-metric genérico, gradientes, cards de ícone repetidos). Não é produto voltado a impressionar; é ferramenta de trabalho pra 2 pessoas.

## Design Principles
- Densidade de informação sobre espaço decorativo — é tela de auditoria, não landing page.
- Números e status nunca dependem só de cor (suporte a leitura rápida e a daltonismo).
- Sem ação = sem ambiguidade visual sobre o que é clicável; a maior parte da UI é texto/tabela estático.
- Consistência com shadcn/ui + Tailwind v3 já em uso (ver CLAUDE.md do projeto) — não introduzir sistema visual paralelo.

## Accessibility & Inclusion
Sem WCAG level formal exigido (uso interno, 2 usuários). Ainda assim: contraste de texto bom o suficiente pra leitura confortável, e status (ex: split ativo/inativo) sinalizado com texto/ícone além de cor.
