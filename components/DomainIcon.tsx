import { Domain } from "@/lib/storage";

export default function DomainIcon({ domain, className }: { domain: Domain; className?: string }) {
  const common = { className, fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

  if (domain === "musique") {
    return (
      <svg {...common}>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
      </svg>
    );
  }

  if (domain === "esport") {
    return (
      <svg {...common}>
        <rect x="2" y="8" width="20" height="9" rx="4" />
        <path d="M7 11v3M5.5 12.5h3" />
        <circle cx="15.5" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 21s-7-4.35-9.5-9C.9 8.1 2.4 4.8 5.6 4.2 8 3.7 10 5 12 7c2-2 4-3.3 6.4-2.8 3.2.6 4.7 3.9 3.1 7.8C19 16.65 12 21 12 21Z" />
    </svg>
  );
}
