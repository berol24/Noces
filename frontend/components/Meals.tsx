"use client";

import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { Reveal } from "@/components/Reveal";
import { useLocale } from "@/lib/locale";

export function Meals() {
  const wedding = useWedding();
  const { t } = useLocale();
  const items = (wedding.meals?.items || []).filter((item) => item.name.trim() || item.detail.trim());

  if (items.length === 0) return null;

  return (
    <section>
      <Reveal from="left">
        <SectionHeading kicker={t("meals")} />
      </Reveal>
      {wedding.meals?.note ? <p className="prose">{wedding.meals.note}</p> : null}
      <ul className="meal-list">
        {items.map((item) => (
          <li key={`${item.name}-${item.detail}`}>
            {item.name ? <strong>{item.name}</strong> : null}
            {item.detail ? <span className="meal-detail">{item.detail}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
