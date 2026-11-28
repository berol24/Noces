"use client";

import { useWedding } from "@/components/wedding-context";
import { coupleLine, fullDate, placeLine } from "@/lib/text";

function loop(items: string[]) {
  const line = items.filter(Boolean);
  return line.length ? [...line, ...line] : [];
}

export function EdgeMarquee({ band = false }: { band?: boolean }) {
  const wedding = useWedding();
  const names = coupleLine(wedding).split("&").map((name) => name.trim()).filter(Boolean);
  const when = [fullDate(wedding), placeLine(wedding)].filter((item) => item.replace(/[,\s]/g, ""));
  const left = loop(names.length ? names : ["Noces"]);
  const right = loop(when.length ? when : names);
  const across = loop([...names, ...when]);

  if (band) {
    if (across.length === 0) return null;
    return (
      <div className="edge-band no-print" aria-hidden="true">
        <div className="edge-track across">
          {across.map((item, index) => <span key={`b-${index}`}>{item}</span>)}
        </div>
      </div>
    );
  }

  if (left.length === 0 && right.length === 0) return null;

  return (
    <>
      <div className="edge-marquee left no-print" aria-hidden="true">
        <div className="edge-track up">
          {left.map((item, index) => <span key={`l-${index}`}>{item}</span>)}
        </div>
      </div>
      <div className="edge-marquee right no-print" aria-hidden="true">
        <div className="edge-track down">
          {right.map((item, index) => <span key={`r-${index}`}>{item}</span>)}
        </div>
      </div>
    </>
  );
}
