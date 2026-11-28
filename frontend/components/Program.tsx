"use client";

import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { Reveal } from "@/components/Reveal";
import { useLocale } from "@/lib/locale";

export function Program() {
  const wedding = useWedding();
  const { t } = useLocale();
  if (!wedding.program.enabled || wedding.program.items.length === 0) return null;

  return (
    <section>
      <Reveal from="right">
        <SectionHeading kicker={t("program")} title={wedding.program.subtitle} />
      </Reveal>
      <div className="timeline">
        {wedding.program.items.map((item, index) => (
          <Reveal from={index % 2 ? "right" : "left"} key={`${item.time}-${item.title}`}>
            <div className={item.highlight ? "tl-item highlight" : "tl-item"}>
              <div className="tl-time">{item.time}</div>
              <p className="tl-title">
                <span aria-hidden="true">{item.icon}</span>
                {item.title}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      {wedding.program.note ? (
        <Reveal from="left">
          <p className="note">— {wedding.program.note} —</p>
        </Reveal>
      ) : null}
    </section>
  );
}
