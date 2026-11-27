import { Fragment } from "react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  /** Sem destino = texto simples (usado no item atual). */
  to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-oi-text-muted">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={item.label}>
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-oi-text hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-oi-text" : undefined} aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <span className="select-none" aria-hidden="true">
                ·
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
