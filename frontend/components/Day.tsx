"use client";

import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { Reveal } from "@/components/Reveal";
import { ceremonyQuery, fullDate, mapUrl, placeLine } from "@/lib/text";

function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  if (key.includes("facebook")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" />
      </svg>
    );
  }
  if (key.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zm8 1.8H8A2.2 2.2 0 0 0 5.8 8v8A2.2 2.2 0 0 0 8 18.2h8a2.2 2.2 0 0 0 2.2-2.2V8A2.2 2.2 0 0 0 16 5.8zM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm5-1.1a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
      </svg>
    );
  }
  if (key.includes("you")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3z" />
      </svg>
    );
  }
  return <span aria-hidden="true">{label.slice(0, 1)}</span>;
}

export function Day() {
  const wedding = useWedding();
  const links = wedding.church.links.filter((link) => link.href && !/facebook/i.test(`${link.label} ${link.href}`));
  const showChurch = wedding.church.enabled && links.length > 0;

  return (
    <section>
      <Reveal from="left">
        <SectionHeading kicker="Le jour J" title={fullDate(wedding)} />
      </Reveal>
      <Reveal from="right">
        <p className="families">{placeLine(wedding)}</p>
      </Reveal>
      {wedding.ceremonies.map((ceremony, index) => {
        const query = ceremonyQuery(ceremony, wedding);
        return (
          <Reveal from={index % 2 ? "right" : "left"} key={`${ceremony.title}-${ceremony.time}`}>
            <article className="venue">
              <h3>{ceremony.title}</h3>
              <p className="time">{ceremony.time}</p>
              <p className="place">{ceremony.venue}</p>
              <p className="address">{ceremony.address}</p>
              {query ? (
                <a className="map-link" href={mapUrl(query)} target="_blank" rel="noreferrer">
                  Voir sur la carte →
                </a>
              ) : null}
            </article>
          </Reveal>
        );
      })}
      {wedding.betweenCeremonies ? (
        <Reveal>
          <p className="between">✦ {wedding.betweenCeremonies} ✦</p>
        </Reveal>
      ) : null}
        {showChurch ? (
          <Reveal from="right">
            <p className="kicker" style={{ marginTop: 28 }}>
              {wedding.church.title}
            </p>
            <div className="socials">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${link.label} — ${wedding.church.name}`}
                >
                  <SocialIcon label={link.label} />
                </a>
              ))}
            </div>
          </Reveal>
        ) : null}
    </section>
  );
}
