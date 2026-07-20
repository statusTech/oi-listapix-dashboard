---
name: Lista Pix Dashboard
description: Dashboard super-admin somente leitura da saúde financeira dos clientes Lista Pix da Oi Tickets
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.145 0 0)"
  primary: "oklch(0.665 0.186 249.503)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.97 0 0)"
  secondary-foreground: "oklch(0.205 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  destructive-foreground: "oklch(0.985 0 0)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(0.708 0 0)"
typography:
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  headline:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
rounded:
  sm: "calc(0.5rem - 4px)"
  md: "calc(0.5rem - 2px)"
  lg: "0.5rem"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: Lista Pix Dashboard

## 1. Overview

**Creative North Star: "O Balancete"**

Ferramenta de auditoria interna, não produto voltado a impressionar. Duas pessoas (super-admin) abrem, escaneiam números, saem. A superfície inteira é neutro cinza claro sobre branco — nenhuma cor compete com o dado. Existe exatamente um acento: o azul da Oi Tickets, usado só onde marca um estado que importa checar (split ativo, filtro selecionado). Fora disso, tudo é texto e tabela.

Rejeita explicitamente qualquer estética de dashboard de SaaS de vendas: nada de hero-metric com gradiente, nada de cards de ícone repetidos, nada de cor decorativa. Se um elemento não carrega dado, ele não devia estar lá.

**Key Characteristics:**
- Cinza neutro (chroma 0) domina; azul Oi aparece em <10% da superfície
- Densidade de informação (tabela expansível, linhas por evento) acima de respiro visual
- Quase flat: única sombra do sistema é `shadow-sm` no Card
- Status nunca depende só de cor (texto "Sim"/"Não" acompanha o Badge)

## 2. Colors

Paleta restrita: neutros cinza + um único acento azul, estratégia Restrained.

### Primary
- **Azul Oi** (oklch(0.665 0.186 249.503)): a cor institucional da Oi Tickets. Usada só pra marcar estado ativo — botão de filtro selecionado, Badge "Split: Sim", barra do gráfico de cliente splitado, ponto do dot legend. Nunca decorativa.

### Neutral
- **Branco** (oklch(1 0 0)): fundo da página e dos cards.
- **Cinza quase-preto** (oklch(0.145 0 0)): texto principal (`foreground`).
- **Cinza claro** (oklch(0.97 0 0)): fundo de badge secundário, hover de linha de tabela (`secondary`/`muted`/`accent`, todos no mesmo valor).
- **Cinza médio** (oklch(0.556 0 0)): texto secundário, labels de card (`muted-foreground`).
- **Cinza borda** (oklch(0.922 0 0)): bordas de input, card, divisórias de tabela.

### Named Rules
**The One Accent Rule.** Azul Oi só existe pra dizer "isso está splitado" ou "isso está selecionado". Se um elemento novo quer usar azul só pra chamar atenção sem carregar esse significado, a resposta é não — usar peso de fonte ou tamanho em vez de cor.

## 3. Typography

**Display/Body Font:** ui-sans-serif, system-ui, sans-serif (stack padrão do Tailwind, sem fonte customizada)

**Character:** Neutra e utilitária de propósito — não é uma escolha de marca, é a fonte do sistema operacional do usuário. Não introduzir fonte customizada; adicionaria peso sem ganho pra uma tela de 2 usuários.

### Hierarchy
- **Headline** (600, 1.5rem/2rem): título de página ("Lista Pix — Dashboard").
- **Title** (600, 1.25rem/1.75rem): `CardTitle` quando usado pra número grande (ex: card "Total vendido" com valor).
- **Body** (400, 0.875rem/1.25rem): texto de tabela, valores monetários em linha, texto padrão de UI.
- **Label** (500, 0.75rem/1rem): `CardTitle` de resumo (ex: "Total vendido" como rótulo pequeno acima do valor), legendas do gráfico.

### Named Rules
**The No-Emphasis-By-Font Rule.** Hierarquia vem de tamanho (text-sm → text-2xl) e peso (400 → 600), nunca de itálico ou fonte alternativa.

## 4. Elevation

Quase flat por design. A única sombra do sistema é `shadow-sm` no `Card` (bordas de card já fazem a separação visual primária — a sombra é reforço sutil, não protagonista). Nenhum outro elemento (botão, input, badge, linha de tabela) usa sombra; estado de hover/foco é sinalizado por mudança de cor de fundo (`hover:bg-accent`, `hover:bg-muted/50`) ou anel de foco (`focus-visible:ring-2`), nunca por elevação.

### Shadow Vocabulary
- **card** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`, Tailwind `shadow-sm`): único uso de sombra no sistema, aplicado a todo `Card`.

### Named Rules
**The Flat-Except-Card Rule.** Se um componente novo "precisa" de sombra pra se destacar, a resposta certa quase sempre é virar um `Card` — não inventar um novo nível de elevação.

## 5. Components

### Buttons
- **Shape:** cantos levemente arredondados (6px, `rounded-md`)
- **Primary (`default`):** fundo Azul Oi, texto branco, `hover:bg-primary/90`. Usado no botão de filtro ativo ("Todos"/"Splitados"/"Não splitados" quando selecionado).
- **Outline:** fundo transparente, borda cinza, `hover:bg-accent`. Usado no botão "Sair" e nos filtros não-selecionados.
- **Hover/Focus:** mudança de opacidade/cor de fundo, sem sombra; anel de foco azul (`ring-2 ring-ring`) em teclado.

### Badges
- **Style:** pílula (`rounded-full`), texto pequeno em caixa alta funcional (não uppercase forçado no CSS, mas curto: "Sim"/"Não")
- **Default (splitado):** fundo Azul Oi, texto branco.
- **Secondary (não splitado):** fundo cinza claro, texto cinza escuro. Nunca some da tela por depender só de cor — o texto "Sim"/"Não" sempre acompanha.

### Cards / Containers
- **Corner Style:** 8px (`rounded-lg`)
- **Background:** branco sobre fundo branco da página, diferenciado só pela borda + `shadow-sm`
- **Border:** 1px cinza claro (`border`)
- **Internal Padding:** 24px (`p-6`), sem padding-top no content quando segue header (`pt-0`)

### Inputs / Fields
- **Style:** borda 1px cinza, fundo branco, `rounded-md`, altura 40px (`h-10`)
- **Focus:** anel azul 2px + offset (`focus-visible:ring-2 focus-visible:ring-ring`), sem mudança de borda

### Tabelas (componente central da tela)
- **Header:** texto cinza médio, peso médio, sem fundo diferenciado
- **Row hover:** `hover:bg-muted/50` — sinaliza que a linha é clicável (expande eventos do cliente)
- **Linha expandida (eventos de um cliente):** fundo `bg-neutral-50`, texto recuado (`pl-8`), fonte menor — indica nível hierárquico sem precisar de ícone de árvore

### Gráfico de barra por cliente (`ClientBarChart`, componente customizado)
- **Barra:** trilho cinza claro (`bg-neutral-100`) com barra preenchida — Azul Oi se cliente splitado, cinza médio (`bg-neutral-400`) se não. Mesma regra de cor do Badge, reforçando o significado em dois lugares.
- **Label de valor:** dentro da barra em branco se houver espaço (≥30% de largura), fora da barra em cinza se não houver.
- **Tooltip:** fundo cinza quase-preto (`bg-neutral-900`), texto branco, aparece só no hover/focus da barra.

## 6. Do's and Don'ts

### Do:
- **Do** manter o Azul Oi restrito a estado "splitado" ou "selecionado" — nunca decorativo.
- **Do** acompanhar todo indicador de cor (badge, barra, dot) de texto ou posição que carregue o mesmo significado, pra não depender só de cor.
- **Do** usar `Card` + `shadow-sm` quando um elemento precisar se destacar do fundo; não inventar sombra maior.
- **Do** manter densidade de tabela (linha expansível) como padrão de novas visualizações — é uma tela de auditoria, não uma vitrine.

### Don't:
- **Don't** usar gradiente, glassmorphism ou hero-metric com cor de destaque — este é o anti-padrão de SaaS de vendas que o PRODUCT.md rejeita explicitamente.
- **Don't** introduzir uma segunda cor de acento. Se um novo estado precisa de sinalização visual, usar peso/tamanho de fonte antes de propor cor nova.
- **Don't** adicionar fonte customizada — o stack de sistema já serve ao propósito utilitário da ferramenta.
- **Don't** usar `border-left`/`border-right` colorido como indicador de status (padrão banido em qualquer registro) — usar Badge ou cor de fundo de barra, como já é feito aqui.
