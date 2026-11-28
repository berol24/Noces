"use client";

import { useEffect, useState } from "react";
import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { Reveal } from "@/components/Reveal";
import { downloadCalendar, googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar";
import { dayKey, fullDate } from "@/lib/text";
import { useLocale } from "@/lib/locale";

function Units({ target }: { target: number }) {
  const { t } = useLocale();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, target - (now ?? target));
  const parts = [
    { label: t("days"), value: Math.floor(diff / 86400000) },
    { label: t("hours"), value: Math.floor((diff % 86400000) / 3600000) },
    { label: t("minutes"), value: Math.floor((diff % 3600000) / 60000) },
    { label: t("seconds"), value: Math.floor((diff % 60000) / 1000) },
  ];

  return (
    <div className="digits" aria-label="Compte à rebours">
      {parts.map((part, index) => (
        <div className="unit" key={part.label} style={{ display: "contents" }}>
          {index > 0 ? <span className="colon">:</span> : null}
          <div>
            <div className="boxes">
              {String(part.value).padStart(2, "0").split("").map((digit, digitIndex) => (
                <span key={`${part.label}-${digitIndex}`}>{digit}</span>
              ))}
            </div>
            <small>{part.label}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CountdownReadout() {
  const wedding = useWedding();
  const target = new Date(wedding.date.iso).getTime();
  const now = Date.now();
  const started = now >= target;
  const today = started && dayKey(now, wedding) === dayKey(target, wedding);

  if (started) {
    return <p className="past-line">{today ? wedding.countdown.today : wedding.countdown.past}</p>;
  }

  return (
    <div className="hero-countdown">
      <p className="kicker">{wedding.countdown.before}</p>
      <Units target={target} />
    </div>
  );
}

export function Countdown() {
  const wedding = useWedding();
  const { t } = useLocale();
  const target = new Date(wedding.date.iso).getTime();
  const now = Date.now();
  const started = now >= target;
  const today = started && dayKey(now, wedding) === dayKey(target, wedding);

  return (
    <section>
      <Reveal from="left">
        <SectionHeading kicker={t("countdown")} title={started ? undefined : wedding.countdown.before} />
      </Reveal>
      <Reveal from="right">
        {started ? (
          <p className="past-line">{today ? wedding.countdown.today : wedding.countdown.past}</p>
        ) : (
          <Units target={target} />
        )}
        <p className="note">{fullDate(wedding)}</p>
      </Reveal>
      <Reveal from="left">
        <div className="calendar-choices">
          <a className="line-btn" href={googleCalendarUrl(wedding)} target="_blank" rel="noreferrer">
            {t("google")}
          </a>
          <a className="line-btn" href={outlookCalendarUrl(wedding)} target="_blank" rel="noreferrer">
            {t("outlook")}
          </a>
          <button className="line-btn" type="button" onClick={() => downloadCalendar(wedding)}>
            {t("apple")}
          </button>
        </div>
      </Reveal>
    </section>
  );
}
