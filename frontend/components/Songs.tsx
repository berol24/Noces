"use client";

import { useState } from "react";
import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { useAudio } from "@/components/audio";
import { Reveal } from "@/components/Reveal";

function clock(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function Songs() {
  const wedding = useWedding();
  const songs = wedding.music.songs;
  const [index, setIndex] = useState(0);
  const audio = useAudio();
  if (songs.length === 0) return null;

  const active = songs[index] ?? songs[0];
  const playing = audio.songPlaying && audio.activeSrc === active.src && Boolean(active.src);
  const ratio = audio.songDuration ? Math.min(audio.songTime / audio.songDuration, 1) : 0;

  return (
    <section>
      <Reveal from="left">
        <SectionHeading kicker="Nos chansons" title="Appuyez pour écouter" />
      </Reveal>
      <Reveal from="right">
        <div className="people" role="tablist" aria-label="Chansons du couple">
          {songs.map((song, songIndex) => (
            <button
              key={`${song.person}-${songIndex}`}
              type="button"
              role="tab"
              aria-pressed={songIndex === index}
              onClick={() => setIndex(songIndex)}
            >
              {song.person}
            </button>
          ))}
        </div>
      </Reveal>
      <Reveal from="left">
        <p className="track">{active.title}</p>
        <p className="artist">{active.artist}</p>
        {active.src ? (
          <div className="player">
            <button
              className="play"
              type="button"
              aria-label={playing ? "Pause" : "Lecture"}
              onClick={() => audio.playSong(active.src)}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <div
              className="bar"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                audio.seekSong((event.clientX - rect.left) / rect.width);
              }}
            >
              <i style={{ width: `${playing || audio.activeSrc === active.src ? ratio * 100 : 0}%` }} />
            </div>
            <div className="times">
              <span>{audio.activeSrc === active.src ? clock(audio.songTime) : "0:00"}</span>
              <span>{audio.activeSrc === active.src ? clock(audio.songDuration) : "0:00"}</span>
            </div>
          </div>
        ) : (
          <p className="note">Ajoutez le fichier dans public/music, puis son chemin dans la configuration.</p>
        )}
      </Reveal>
    </section>
  );
}
