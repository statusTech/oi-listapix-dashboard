import { useEffect, useState } from "react";
import axios from "axios";
import { functionalUpdate, type OnChangeFn, type PaginationState } from "@tanstack/react-table";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { cleanParams, errorMessage } from "@/lib/logs";
import type { Paginated } from "@/types/logs";

const DEFAULT_PAGE_SIZE = 50;

/**
 * Listagem de logs com filtros e paginação no servidor. `filters` é o que está
 * no formulário; a consulta só muda em `search`, `clear`, troca de página ou
 * `retry`.
 */
export function useServerLogs<TFilters extends object, TItem>(
  url: string,
  createFilters: () => TFilters,
  fallbackError: string,
) {
  const [filters, setFilters] = useState<TFilters>(createFilters);
  const [query, setQuery] = useState(() => ({ filters, pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE }));
  const [data, setData] = useState<Paginated<TItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api
      .get<Paginated<TItem>>(url, {
        signal: controller.signal,
        params: cleanParams({
          ...(query.filters as Record<string, string>),
          page: query.pageIndex + 1,
          limit: query.pageSize,
        }),
      })
      .then(({ data: body }) => {
        // O total encolheu e a página pedida deixou de existir: vai para a última.
        const lastIndex = Math.max(0, Math.ceil(body.total / body.limit) - 1);
        if (body.items.length === 0 && query.pageIndex > lastIndex) {
          setQuery((prev) => ({ ...prev, pageIndex: lastIndex }));
          return;
        }
        setData(body);
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        const message = errorMessage(err, fallbackError);
        // Descarta os dados anteriores: eles são de outra consulta.
        setData(null);
        setError(message);
        setLoading(false);
        toast({ variant: "destructive", title: message });
      });
    return () => controller.abort();
  }, [url, query, fallbackError]);

  // Depois da resposta vale o `limit` da API, que é o que define o nº de páginas.
  const pageSize = !loading && data ? data.limit : query.pageSize;
  const pagination: PaginationState = { pageIndex: query.pageIndex, pageSize };

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = functionalUpdate(updater, pagination);
    const sizeChanged = next.pageSize !== pagination.pageSize;
    if (!sizeChanged && next.pageIndex === pagination.pageIndex) return;
    setQuery((prev) => ({ ...prev, pageSize: next.pageSize, pageIndex: sizeChanged ? 0 : next.pageIndex }));
  };

  function setFilter<K extends keyof TFilters>(key: K, value: TFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function search() {
    setQuery((prev) => ({ ...prev, filters, pageIndex: 0 }));
  }

  function clear() {
    const fresh = createFilters();
    setFilters(fresh);
    setQuery((prev) => ({ ...prev, filters: fresh, pageIndex: 0 }));
  }

  function retry() {
    setQuery((prev) => ({ ...prev }));
  }

  return { filters, setFilter, search, clear, retry, data, loading, error, pagination, onPaginationChange };
}
