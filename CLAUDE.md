# CLAUDE.md

Guia para Claude Code trabalhando neste repositório. Projeto **novo e isolado** — repo próprio (`https://github.com/statusTech/oi-listapix-dashboard.git`), não faz parte do monorepo `server-node-backend`/`painel`/`oi-store`, mas consome a API do `server-node-backend` (ver `../server-node-backend/CLAUDE.md` pro contexto da plataforma principal).

## O que é

Dashboard super-admin, somente leitura, mostrando por cliente (tenant) com Lista Pix ativo: eventos ativos, total vendido, total de taxas, status de split — mais um resumo geral. Spec original: `../planos/2026-07-19-listapix-dashboard-design.md` e `../planos/2026-07-19-listapix-dashboard-plan.md` (plano de implementação, já executado — histórico de decisões e correções pós-plano está lá, inclusive as duas correções de regra de negócio abaixo).

## Comandos

```bash
npm run dev         # Vite dev server, porta 5183 (vite.config.ts:12)
npm run build        # tsc -b && vite build
npm run typecheck     # tsc --noEmit
npm run preview       # preview do build de produção
```

Sem suite de testes — projeto pequeno, somente leitura, verificado via typecheck + checagem visual em navegador (ver plano, Tasks 5-9).

## Arquitetura

- **Stack**: Vite 5 + React 18 + TypeScript 5, Tailwind **v3.4.19** (não v4 — ver seção própria abaixo), shadcn/ui, react-router-dom 6, axios, Firebase Auth (SDK modular v10).
- **Estrutura**: `src/lib/` (firebase.ts, api.ts, utils.ts) → `src/context/AuthContext.tsx` → `src/components/ProtectedRoute.tsx` + `src/components/ui/*` (shadcn) + `src/components/ClientBarChart.tsx` (gráfico de barra custom, sem lib externa) → `src/pages/Login.tsx` + `Dashboard.tsx` → `src/types/dashboard.ts` (contrato com a API).
- **Backend consumido**: `GET /admin/listapix-dashboard/overview` em `server-node-backend` (`src/controllers/ListaPixDashboardController.js`, rota em `src/routes.js` — protegida por `authorize(MASTER)`, só usuário master vê). Local: `http://localhost:3010/api/v1`. Produção: `https://api.oitickets.com.br/api/v1`.
- **Auth**: Firebase Auth (mesmo projeto `oi-tickets` do `admin.oitickets.com.br`) + `POST /authenticateDash` (troca UID do Firebase por JWT do backend). Allowlist de 2 UIDs master hardcoded em `src/context/AuthContext.tsx:8` (mesma allowlist de `admin/src/service/auth.js:8,18` — mudar em um lugar exige mudar no outro, não há fonte única). Estado "não autenticado" é `token === null` (`AuthContext.tsx`), não um boolean — propositalmente diferente do bug do `admin/` (`authUser === false` nunca verdadeiro).
- **Interceptor 401** (`src/lib/api.ts`): limpa token e redireciona pra `/login`, exceto quando já está em `/login` (guard adicionado pra não recarregar a página no meio de uma tentativa de login que falha por 401).

### Tailwind v3, não v4 — decisão deliberada, não desatualização

A CLI `shadcn@latest` atual (v4.x) gera sintaxe exclusiva de Tailwind v4 (`gap-(--var)`, `rounded-4xl`, `--spacing()`) que quebra sob Tailwind v3. Testado e revertido (histórico de commits do repo, mensagens "shadcn/ui" contam a história completa — 3 tentativas). Decisão: **ficar em Tailwind v3** + `shadcn@2.x` pros templates de componente, com dois ajustes manuais necessários porque o *registry* remoto do shadcn (`ui.shadcn.com/r/colors/*.json`) hoje só serve cores em `oklch(...)` completo, não mais tripla HSL:
- `tailwind.config.cjs`: toda cor usa `oklch(from var(--x) l c h / <alpha-value>)`, não `var(--x)` puro nem `hsl(var(--x))` — `var()` puro quebra silenciosamente todo utilitário de opacidade (`bg-primary/50` etc.), `hsl()` em cima de um valor já-oklch é CSS inválido.
- `package.json`: `tailwind-merge` tem que ficar em `^2.x`, nunca `^3.x` (v3 do tailwind-merge assume config de classe do Tailwind v4).

Não "resolver" isso migrando pra Tailwind v4 sem avaliar o custo — funciona hoje, é intencional.

### Regras de negócio corrigidas pós-implementação (dado real divergiu do plano original)

- **Cliente elegível**: `Clients/<id>.hasECommerce === true` — campo **top-level**, não `eCommerce.hasECommerce`. O plano original errou isso (assumiu aninhado); corrigido comparando com log real de produção.
- **Split**: `eCommerce.hasSplit === true` — **não** `eCommerce.chargeClient`. `chargeClient` é conceito de billing (quem paga a taxa administrativa), diferente de "split configurado de fato" (toggle "Split" do `admin.oitickets.com.br`). Corrigido depois que um cliente real (Sociedade Vera Cruz) mostrou `chargeClient: true` + `hasSplit: false` com o painel admin marcando Split desligado — o dashboard mostrava "Sim" errado até a correção.
- **Valores monetários**: `orderproducts.price_total`/`tax_value` são armazenados em **centavos** no banco (confirmado contra `server-node-backend/src/controllers/PaymentController.js:638-645`, que usa o mesmo padrão e nomeia a variável `totalCentavos`). `computeEventTotals` (`server-node-backend/src/services/listaPixDashboard/eventTotals.js`) divide por 100 antes de retornar — se algum código novo ler essas colunas direto, não esquecer da conversão.

### Deploy

- Vercel: projeto `fnsystems/listapix-dashboard`, produção em `https://listapix-dashboard.vercel.app`. Domínio customizado `admin.listapix.com` planejado mas DNS ainda não configurado (pendência manual, precisa de acesso ao provedor de DNS — não é algo que o agente resolve sozinho).
- Env vars de produção (8x `VITE_FIREBASE_*` + `VITE_API_BASE_URL`) configuradas direto no dashboard da Vercel via `vercel env add`, não existem no repo (só em `.env.local`, gitignored).
- `vercel.json` na raiz: rewrite de SPA (`/(.*)` → `/index.html`) — sem isso, refresh em `/login` ou qualquer rota que não seja `/` dá 404 no Vercel.
- CORS de produção: `server-node-backend/src/index.js` (`allowedOrigins`) já libera `https://listapix-dashboard.vercel.app` e `https://admin.listapix.com`, mas esses commits estão só locais na branch `feat/communication-logs` do backend — não vão pra produção até essa branch ser deployada.

### Local

Precisa do `server-node-backend` rodando (`npm run dev`, porta 3010) com `CORS_ORIGINS=http://localhost:5183` no `.env` dele. Sem isso, todo POST/GET pro backend local falha por CORS. Testado ponta a ponta com dados reais de dois tenants locais (Status Tech, Sociedade Vera Cruz).
