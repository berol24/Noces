import type { Metadata } from "next";
import { FairePart } from "@/components/FairePart";
import { PrintBar } from "@/components/PrintBar";
import { coupleLine } from "@/lib/text";

export const metadata: Metadata = {
  title: `Faire-part · ${coupleLine()}`,
};

export default function FairePartPage() {
  return (
    <>
      <PrintBar />
      <div className="poster-wrap">
        <FairePart />
      </div>
    </>
  );
}
