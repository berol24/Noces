import type { ReactNode } from "react";

export function Leaf({ className = "" }: { className?: string }) {
  return (
    <span className={`leaf ${className}`}>
      <svg viewBox="0 0 120 280" aria-hidden="true">
        <path
          d="M60 6C92 74 118 150 60 274C2 150 28 74 60 6Z"
          fill="currentColor"
        />
        <path
          d="M60 28C62 110 62 190 60 258"
          fill="none"
          stroke="rgba(246,241,231,0.12)"
          strokeWidth="1.5"
        />
      </svg>
    </span>
  );
}

export function Flower({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="var(--flower)">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="32"
            cy="14"
            rx="6"
            ry="12"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="4.5" fill="var(--accent-deep)" />
    </svg>
  );
}

export function Leaves({ fixed = false }: { fixed?: boolean }) {
  return (
    <div className={fixed ? "leaves leaves-fixed" : "leaves"} aria-hidden="true">
      <Leaf className="l1" />
      <Leaf className="l2" />
      <Leaf className="l3" />
      <Leaf className="l4" />
      <Leaf className="l5" />
      <Leaf className="l6" />
      <Flower className="flower f1" />
      <Flower className="flower f2" />
      <Flower className="flower f3" />
      <Flower className="flower f4" />
      <Flower className="flower f5" />
    </div>
  );
}

export function Monogram({
  top,
  bottom,
  size = 150,
}: {
  top: string;
  bottom: string;
  size?: number;
}) {
  return (
    <div className="monogram" style={{ width: size, height: size }}>
      <svg className="ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="36" fill="var(--bg)" />
        <circle cx="50" cy="50" r="47" fill="none" stroke="var(--accent-deep)" strokeWidth="0.7" />
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.45"
          strokeDasharray="1.1 2.5"
        />
        {[0, 90, 180, 270].map((deg) => (
          <rect
            key={deg}
            x="48.5"
            y="1.2"
            width="3"
            height="3"
            fill="var(--accent)"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
      </svg>
      <div className="mono-letters">
        <span>{top}</span>
        <em>&</em>
        <span>{bottom}</span>
      </div>
    </div>
  );
}

export function Rings({ className = "" }: { className?: string }) {
  return (
    <svg className={`rings ${className}`} viewBox="0 0 84 40" aria-hidden="true">
      <circle cx="30" cy="22" r="13" fill="none" stroke="var(--accent)" strokeWidth="1.3" />
      <circle cx="54" cy="22" r="13" fill="none" stroke="var(--accent-deep)" strokeWidth="1.3" />
      <path d="M42 6c1.6 3.2 1.6 5.4 0 8.2-1.6-2.8-1.6-5 0-8.2z" fill="var(--flower)" />
      <path d="M42 6c2.2 2.4 4.6 2.2 6.4.4-2.2.2-4 .8-6.4-.4z" fill="var(--accent)" />
    </svg>
  );
}

export function DiamondRule() {
  return (
    <div className="diamond-rule" aria-hidden="true">
      <span />
      <svg viewBox="0 0 12 12">
        <path d="M6 0 L12 6 L6 12 L0 6 Z" />
      </svg>
      <span />
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
}: {
  kicker: string;
  title?: string;
}) {
  return (
    <header className="section-head">
      <Rings />
      <p className="kicker">{kicker}</p>
      {title ? <h2>{title}</h2> : null}
    </header>
  );
}

export function IconButton({
  label,
  href,
  onClick,
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (href) {
    return (
      <a className="icon-btn" href={href} aria-label={label}>
        {children}
      </a>
    );
  }
  return (
    <button className="icon-btn" type="button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}
