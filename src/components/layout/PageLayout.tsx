import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";

interface PageLayoutProps {
  breadcrumb: BreadcrumbItem[];
  title: string;
  /** Informação curta alinhada à direita do título. */
  titleRight?: ReactNode;
  /** Barra de filtros e ações, logo abaixo do título. */
  filters?: ReactNode;
  children: ReactNode;
  busy?: boolean;
}

/** Estrutura de página igual à do painel: breadcrumb, título e filtros fora dos cards. */
export function PageLayout({ breadcrumb, title, titleRight, filters, children, busy }: PageLayoutProps) {
  return (
    <div className="flex w-full min-w-0 flex-col" aria-busy={busy}>
      <Breadcrumb items={breadcrumb} />
      <div className="mt-4 flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-oi-text">{title}</h1>
            {titleRight}
          </div>
          {filters}
        </div>
        {children}
      </div>
    </div>
  );
}
