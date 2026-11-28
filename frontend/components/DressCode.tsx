"use client";

import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { Reveal } from "@/components/Reveal";

import { useLocale } from "@/lib/locale";

export function DressCode() {
  const wedding = useWedding();
  const { t } = useLocale();
  if (!wedding.dressCode.enabled) return null;
  const dress = wedding.dressCode;

  return (
    <section>
      <Reveal from="left">
        <SectionHeading kicker={t("dress")} title={dress.subtitle} />
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
          <p className="dress-consigne">{dress.text}</p>
        </Reveal>
      ) : null}
    </section>
  );
}
