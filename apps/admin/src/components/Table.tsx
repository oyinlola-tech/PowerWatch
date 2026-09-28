import type { ReactNode } from "react";

/**
 * Tables scroll sideways inside their own container on narrow screens, so the page never does.
 * The caption is visually hidden but read by screen readers.
 */
export function Table({ caption, head, children }: { caption: string; head: ReactNode; children: ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-5" tabIndex={0} role="region" aria-label={caption}>
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">{head}</tr>
        </thead>
        <tbody className="divide-y divide-line-light">{children}</tbody>
      </table>
    </div>
  );
}

export const Th = ({ children, className = "" }: { children?: ReactNode; className?: string }) => (
  <th scope="col" className={`whitespace-nowrap px-4 py-3 font-semibold first:pl-4 sm:first:pl-5 last:pr-4 sm:last:pr-5 ${className}`}>
    {children}
  </th>
);

export const Td = ({ children, className = "" }: { children?: ReactNode; className?: string }) => (
  <td className={`px-4 py-3 align-middle first:pl-4 sm:first:pl-5 last:pr-4 sm:last:pr-5 ${className}`}>{children}</td>
);
