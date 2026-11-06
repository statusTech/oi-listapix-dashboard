# Dashboard Lista PIX: Logs — contrato para o frontend

**Data:** 2026-11-06
**Jira:** KAN-294 (backend) → KAN-295 (dashboard, menu Logs com Ingressos e Split)
**Repo afetado:** `oi-listapix-dashboard`

Duas rotas para a área **Logs** do Dashboard Lista PIX, juntando **todos os clientes** com Lista PIX (a mesma lista do overview). Permissão: **MASTER**, mesmo token das outras rotas do dashboard.

Respostas no mesmo formato das outras rotas do dashboard: `{ success: true, ... }` e, em erro, `{ success: false, message }` (pt-BR, pronto para exibir).

---

## Filtros comuns

| Parâmetro | Formato | Padrão |
|---|---|---|
| `dateStart`, `dateEnd` | `AAAA-MM-DD`, dias de Brasília, inclusivos | **últimos 7 dias** (hoje e os 6 anteriores) |
| `clientId` | id do cliente (o mesmo `clientId` do overview) | todos |
| `eventName` | parte do nome do evento | — |
| `page` | inteiro ≥ 1 | 1 |
| `limit` | 1 a 200 | 50 |

O período padrão existe para limitar a varredura em todos os clientes; períodos longos funcionam, mas ficam mais lentos.

Data inválida, início depois do fim, valor fora da lista ou página/limite inválidos: **400** com `message`.

Datas na resposta vêm em **ISO UTC** (`2026-11-06T11:06:48.000Z`): exiba em horário de Brasília.

---

## 1. Ingressos — `GET /api/v1/admin/listapix-dashboard/logs/ingressos`

Envios de ingresso por WhatsApp e e-mail, com sucesso ou falha, mais recentes primeiro.

Filtros extras:

| Parâmetro | Valores |
|---|---|
| `status` | `success`, `failed` |
| `channel` | `whatsapp`, `email` |
| `origin` | `store` (Loja), `panel` (Painel) |
| `provider` | `smsbarato` (SMS Barato), `zapi` (Z-API), `email` (E-mail) |
| `error` | código ou texto do erro (ex.: `SMSBARATO_NUMERO_EXCLUIDO` ou `exclusão`) |

**200:**

```json
{
  "success": true,
  "total": 1051,
  "page": 1,
  "limit": 50,
  "period": { "dateStart": "2026-10-31", "dateEnd": "2026-11-06" },
  "items": [
    {
      "id": "-P2hNOo8Ki-Rkg6flJwX:134",
      "sent_at": "2026-11-06T05:04:54.000Z",
      "client": { "id": "-P2hNOo8Ki-Rkg6flJwX", "name": "Victor Fernando Souza Rosa" },
      "event": { "id": "5a75dc1f2ec9", "name": "Baile da Exclusive 47 - DJ Guuga" },
      "order_id": "0RS1hQfLAjcxz_f-AAB9",
      "reference": "00004938",
      "buyer_name": "Maria",
      "recipient": "47*****9262",
      "channel": "whatsapp",
      "origin": "store",
      "status": "success",
      "provider": "zapi",
      "used_fallback": true,
      "error": null,
      "fallback_reason": { "code": "SMSBARATO_NAO_ENTREGUE", "text": "O SMS Barato não confirmou a entrega a tempo" }
    }
  ]
}
```

| Campo | Observação |
|---|---|
| `id` | único entre clientes (`<clientId>:<id do log>`); use como `key` |
| `reference` | extref do pedido (o "pedido" que o cliente vê); `null` se não achar |
| `recipient` | **mascarado**: telefone `47*****9262`, e-mail `m***@x.com` |
| `origin` | `store` = loja (inclui o envio automático do pós-pagamento); `panel` = reenvio pelo painel |
| `provider` | quem fez a última tentativa: `smsbarato`, `zapi` ou `email` |
| `used_fallback` | `true` quando o SMS Barato falhou e o envio foi para o Z-API |
| `fallback_reason` | só quando o envio deu certo pelo Z-API: por que o SMS Barato falhou |
| `error` | `null` no sucesso; na falha `{ code, text }`. Quando falhou nos dois, `code` vem `"SMS|ZAPI"` e `text` traz os dois motivos separados por ` / ` |

Rótulos sugeridos: SMS Barato, Z-API, E-mail; Loja, Painel; Enviado, Falhou.

Observação: logs gravados antes de 15/10/2026 (quando o WhatsApp saía pela loja) seguem a mesma regra e podem aparecer como SMS Barato.

---

## 2. Split — `GET /api/v1/admin/listapix-dashboard/logs/split`

Vendas que caíram na conta da Oi porque a conta Mercado Pago do organizador estava com problema (perda de split), mais recentes primeiro.

Filtro extra: `reason` (parte do texto do motivo).

**200:**

```json
{
  "success": true,
  "total": 806,
  "page": 1,
  "limit": 50,
  "period": { "dateStart": "2026-10-31", "dateEnd": "2026-11-06" },
  "items": [
    {
      "id": 806,
      "occurred_at": "2026-10-29T20:18:12.000Z",
      "client": { "id": "-P52vBABYM5A5dfwXaft", "name": "Rodrigo Sousa - RS Produções" },
      "event": { "id": "c219f82994b1", "name": "Futbaile - Sede da AABB" },
      "order_id": "00004091",
      "amount": 40,
      "reason": "Conta Mercado Pago não conectada — conecte sua conta no painel para receber via split"
    }
  ]
}
```

* `amount` em **reais** (número, ex.: `40` = R$ 40,00), não em centavos.
* `order_id` é o número do pedido (extref) quando existe.
* `client.name` vem `null` se o cliente saiu da lista do dashboard (blacklist ou sem Lista PIX).