"use client";

import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { Reveal } from "@/components/Reveal";

export function DressCode() {
  const wedding = useWedding();
  if (!wedding.dressCode.enabled) return null;
  const dress = wedding.dressCode;

  return (
    <section>
      <Reveal from="left">
        <SectionHeading kicker="Code vestimentaire" title={dress.subtitle} />
      </Reveal>
      <div className="swatches">
        {dress.colors.map((color, index) => (
          <Reveal from={index % 2 ? "right" : "left"} delay={index * 90} key={color.name}>
            <div className="swatch">
              <b style={{ background: color.hex }} />
              <span>{color.name}</span>
            </div>
          </Reveal>
        ))}
      </div>
      {dress.text ? (
        <Reveal from="right">
          <p className="prose">{dress.text}</p>
        </Reveal>
      ) : null}
      {dress.style ? (
        <Reveal from="left">
          <p className="note">{dress.style}</p>
        </Reveal>
      ) : null}
      {dress.warnings.map((warning, index) => (
        <Reveal from={index % 2 ? "left" : "right"} key={warning}>
          <p className="warning">{warning}</p>
        </Reveal>
      ))}
    </section>
  );
}
