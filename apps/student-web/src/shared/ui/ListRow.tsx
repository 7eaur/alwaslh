import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function ListRow({ to, title, subtitle, leading, trailing, className = "" }: {
  to: string;
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <Link className={className} to={to}>
      {leading ?? null}
      <span><strong>{title}</strong>{subtitle ? <small>{subtitle}</small> : null}</span>
      {trailing ?? null}
    </Link>
  );
}
