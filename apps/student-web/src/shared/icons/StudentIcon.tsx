import type { SVGProps } from "react";

export type StudentIconName =
  | "home"
  | "learn"
  | "practice"
  | "library"
  | "notifications"
  | "progress"
  | "account"
  | "subjects"
  | "lessons"
  | "download"
  | "notes"
  | "saved"
  | "review"
  | "result"
  | "search"
  | "chevron";

const common: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  focusable: false,
  "aria-hidden": true,
};

export function StudentIcon({ name, ...props }: { name: StudentIconName } & SVGProps<SVGSVGElement>) {
  const svgProps = { ...common, ...props };
  if (name === "home") return <svg {...svgProps}><path d="M3.5 10.5 12 3.8l8.5 6.7" /><path d="M5.5 9.3V20h13V9.3" /><path d="M9.3 20v-6h5.4v6" /></svg>;
  if (name === "learn") return <svg {...svgProps}><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v17h4.5A3.5 3.5 0 0 1 20 22V5.5Z" /></svg>;
  if (name === "practice") return <svg {...svgProps}><path d="M12 2v3" /><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="3" /><path d="m16.5 7.5 4-4" /><path d="M17.5 3.5h3v3" /></svg>;
  if (name === "library") return <svg {...svgProps}><path d="M5 4h12a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2Z" /><path d="M7 19a2 2 0 0 1 0-4h12" /><path d="M9 8h6" /></svg>;
  if (name === "notifications") return <svg {...svgProps}><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 8H3c0-1 3-1 3-8Z" /><path d="M10 21h4" /></svg>;
  if (name === "progress") return <svg {...svgProps}><path d="M5 19V9M12 19V5M19 19v-7" /><path d="M3 19h18" /></svg>;
  if (name === "account") return <svg {...svgProps}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>;
  if (name === "subjects") return <svg {...svgProps}><path d="m12 3 8 4-8 4-8-4 8-4Z" /><path d="m4 12 8 4 8-4" /><path d="m4 17 8 4 8-4" /></svg>;
  if (name === "lessons") return <svg {...svgProps}><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v17h4.5A3.5 3.5 0 0 1 20 22V5.5Z" /></svg>;
  if (name === "download") return <svg {...svgProps}><path d="M12 3v11" /><path d="m7.5 10 4.5 4.5 4.5-4.5" /><path d="M5 20h14" /></svg>;
  if (name === "notes") return <svg {...svgProps}><path d="M6 3h9l3 3v15H6z" /><path d="M14 3v4h4" /><path d="M9 11h6M9 15h6" /></svg>;
  if (name === "saved") return <svg {...svgProps}><path d="M7 4h10v17l-5-3-5 3z" /></svg>;
  if (name === "review") return <svg {...svgProps}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "result") return <svg {...svgProps}><path d="M5 19V9M12 19V5M19 19v-7" /></svg>;
  if (name === "search") return <svg {...svgProps}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>;
  return <svg {...svgProps}><path d="m9 5 7 7-7 7" /></svg>;
}
