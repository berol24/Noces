"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useWedding } from "@/components/wedding-context";

type AudioContextValue = {
  bgOn: boolean;
  canPlayBackground: boolean;
  songPlaying: boolean;
  songTime: number;
  songDuration: number;
  activeSrc: string;
  playBg: () => void;
  pauseBg: () => void;
  toggleBg: () => void;
  playSong: (src: string) => void;
  seekSong: (ratio: number) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error("Lecteur audio indisponible");
  return value;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const wedding = useWedding();
  const bgRef = useRef<HTMLAudioElement>(null);
  const songRef = useRef<HTMLAudioElement>(null);
  const current = useRef("");
  const [bgOn, setBgOn] = useState(false);
  const [songPlaying, setSongPlaying] = useState(false);
  const [songTime, setSongTime] = useState(0);
  const [songDuration, setSongDuration] = useState(0);
  const [activeSrc, setActiveSrc] = useState("");
  const background = wedding.music.background;
  const canPlayBackground = background.enabled && Boolean(background.src);

  const playBg = () => {
    const bg = bgRef.current;
    if (!bg || !canPlayBackground) return;
    songRef.current?.pause();
    void bg.play().catch(() => setBgOn(false));
  };

  const pauseBg = () => {
    bgRef.current?.pause();
  };

  const toggleBg = () => {
    const bg = bgRef.current;
    if (!bg || !canPlayBackground) return;
    if (!bg.paused) {
      pauseBg();
      return;
    }
    playBg();
  };

  const playSong = (src: string) => {
    const song = songRef.current;
    if (!song || !src) return;
    if (current.current === src && !song.paused) {
      song.pause();
      return;
    }
    bgRef.current?.pause();
    if (current.current !== src) {
      current.current = src;
      setActiveSrc(src);
      song.src = src;
      setSongTime(0);
    }
    void song.play().catch(() => setSongPlaying(false));
  };

  const seekSong = (ratio: number) => {
    const song = songRef.current;
    if (!song || !song.duration) return;
    song.currentTime = Math.min(Math.max(ratio, 0), 1) * song.duration;
  };

  return (
    <AudioContext.Provider
      value={{
        bgOn,
        canPlayBackground,
        songPlaying,
        songTime,
        songDuration,
        activeSrc,
        playBg,
        pauseBg,
        toggleBg,
        playSong,
        seekSong,
      }}
    >
      {canPlayBackground ? (
        <audio
          ref={bgRef}
          className="clip-audio"
          src={background.src}
          loop
          preload="none"
          onPlay={() => setBgOn(true)}
          onPause={() => setBgOn(false)}
        />
      ) : null}
      <audio
        ref={songRef}
        className="clip-audio"
        preload="none"
        onTimeUpdate={(event) => setSongTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setSongDuration(event.currentTarget.duration || 0)}
        onPlay={() => setSongPlaying(true)}
        onPause={() => setSongPlaying(false)}
        onEnded={() => setSongPlaying(false)}
      />
      {children}
    </AudioContext.Provider>
  );
}
