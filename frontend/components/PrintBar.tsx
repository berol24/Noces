"use client";

import { usePathname } from "next/navigation";

export function PrintBar() {
  const pathname = usePathname();
  const back = pathname.endsWith("/faire-part") ? pathname.replace(/\/faire-part$/, "") || "/" : "/";

  return (
    <div className="page-tools no-print">
      <a className="line-btn" href={back} style={{ width: "auto", marginTop: 0 }}>
        Retour
      </a>
      <button className="line-btn" type="button" style={{ width: "auto", marginTop: 0 }} onClick={() => window.print()}>
        Imprimer
      </button>
    </div>
  );
}
