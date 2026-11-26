"use client";

import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { Reveal } from "@/components/Reveal";
import { personName } from "@/lib/text";

export function Story() {
  const wedding = useWedding();
  const invitation = wedding.invitation || wedding.invitationPhoto;
  if (!wedding.story.enabled && !wedding.verse.enabled && !invitation) return null;

  return (
    <section>
      {invitation ? (
        <Reveal from="left">
          <article className="text-band">
            {wedding.invitationPhoto ? <img src={wedding.invitationPhoto} alt="" /> : null}
            {wedding.invitation ? <p className="prose">{wedding.invitation}</p> : null}
          </article>
        </Reveal>
      ) : null}
      {wedding.story.enabled ? (
        <>
          <Reveal>
            <SectionHeading kicker="Notre histoire" />
          </Reveal>
          {wedding.story.passages.map((passage, index) => (
            <Reveal from={index % 2 ? "right" : "left"} key={`${passage.speaker}-${index}`}>
              <article className={passage.photo ? `text-row${index % 2 ? " flip" : ""}` : undefined}>
                {passage.photo ? <img src={passage.photo} alt="" /> : null}
                <div>
                  <p className="speaker">{personName(passage.speaker, wedding)}</p>
                  {passage.quote ? <blockquote className="quote">« {passage.quote} »</blockquote> : null}
                  {passage.text ? <p className="prose">{passage.text}</p> : null}
                </div>
              </article>
            </Reveal>
          ))}
          {wedding.story.closing ? (
            <Reveal from="right">
              <p className="prose">{wedding.story.closing}</p>
            </Reveal>
          ) : null}
        </>
      ) : null}
      {wedding.verse.enabled && (wedding.verse.text || wedding.verse.photo) ? (
        <Reveal from="left">
          <figure className={wedding.verse.photo ? "verse verse-split" : "verse"}>
            {wedding.verse.photo ? <img src={wedding.verse.photo} alt="" /> : null}
            <div>
              {wedding.verse.text ? <p>{wedding.verse.text}</p> : null}
              {wedding.verse.reference ? <cite>{wedding.verse.reference}</cite> : null}
            </div>
          </figure>
        </Reveal>
      ) : null}
    </section>
  );
}
