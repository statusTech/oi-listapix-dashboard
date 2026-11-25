Samuel, o backend desta tarefa (KAN-290) já está em produção. Já dá para usar no dashboard.

Rota: GET /admin/listapix-dashboard/overview?dateStart=2026-11-01&dateEnd=2026-11-30. O formato é AAAA-MM-DD, em dias de Brasília, e as duas datas entram no período. Pode mandar só uma delas.

Com período: os totais de cada evento (totalVendido, totalTaxas, totalItens, totalTransacoes, transacoesIngresso, transacoesMesaCamarote) e o summary contam só as vendas feitas no período, pela data da venda e não pela data do evento.

Eventos a mostrar: evento sem venda no período vem com totalTransacoes = 0. Para mostrar só quem vendeu, filtre por totalTransacoes > 0. Um evento de 2027 com vendas agora aparece normalmente.

Sem datas: traz todas as vendas, como antes.

Erros: data inválida ou início depois do fim devolvem 400 com message.