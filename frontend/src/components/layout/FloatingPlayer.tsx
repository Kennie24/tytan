"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Music2, Pause, Play, SkipBack, SkipForward } from "lucide-react";

interface Track {
  id: number;
  title: string;
  album: string;
  duration: string;
  src?: string;
}

const DEMO_TRACKS: Track[] = [
  { id: 1, title: "Midnight Throne", album: "Dark Frequencies", duration: "3:42" },
  { id: 2, title: "Electric Soul", album: "Dark Frequencies", duration: "4:11" },
  { id: 3, title: "Golden Era", album: "Rise of Tytan", duration: "3:55" },
  { id: 4, title: "War Cry", album: "Rise of Tytan", duration: "4:28" },
];

function EqBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-1 rounded-full eq-bar-${i}`}
          style={{
            height: isPlaying ? undefined : "30%",
            animation: isPlaying ? undefined : "none",
            background: "#1DB954",
          }}
        />
      ))}
    </div>
  );
}

export default function FloatingPlayer() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    // Show player after loading
    const timer = setTimeout(() => setIsVisible(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const nextTrack = useCallback(() => {
    setCurrentTrack((t) => (t + 1) % DEMO_TRACKS.length);
    setProgress(0);
  }, []);

  const prevTrack = useCallback(() => {
    setCurrentTrack((t) => (t - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval((): void => {
        setProgress((p) => {
          if (p >= 100) {
            nextTrack();
            return 0;
          }
          return p + 0.5;
        });
      }, 200);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [isPlaying, currentTrack, nextTrack]);

  const track = DEMO_TRACKS[currentTrack];

  return (
    <div
      ref={playerRef}
      className={`floating-player${isVisible ? "" : " hidden"}`}
    >
      <div className="flex items-center gap-4">
        {/* Album art */}
        <div className="w-11 h-11 rounded-lg flex-shrink-0 overflow-hidden relative">
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #0a0f2e 50%, #16213e 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
            }}
          >
            <Music2 size={22} strokeWidth={1.5} className="text-gold" />
          </div>
          {isPlaying && (
            <div className="vinyl-spin absolute inset-0 border-2 border-gold/20 rounded-lg" />
          )}
        </div>

        {/* Track info + EQ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-medium truncate">
              {track.title}
            </p>
            {isPlaying && <EqBars isPlaying={isPlaying} />}
          </div>
          <p className="text-white/40 text-xs truncate">{track.album}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={prevTrack}
            className="text-white/50 hover:text-white transition-colors text-lg"
            title="Previous"
          >
            <SkipBack size={18} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ 
              background: "#1DB954",
              boxShadow: "0 0 15px rgba(29, 185, 84, 0.4)"
            }}
            title={isPlaying ? "Pause" : "Play"}
          >
            <span className="text-black text-sm">{isPlaying ? <Pause size={16} strokeWidth={2} fill="currentColor" /> : <Play size={16} strokeWidth={2} fill="currentColor" />}</span>
          </button>
          <button
            onClick={nextTrack}
            className="text-white/50 hover:text-white transition-colors text-lg"
            title="Next"
          >
            <SkipForward size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-2.5">
        <div className="progress-bar-container h-[3px]">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-white/30 text-[10px]">
            {Math.floor((progress / 100) * 3 * 60)
              .toString()
              .padStart(2, "0")}
            :
            {Math.floor(((progress / 100) * 3 * 60) % 60)
              .toString()
              .padStart(2, "0")}
          </span>
          <span className="text-white/30 text-[10px]">{track.duration}</span>
        </div>
      </div>
    </div>
  );
}
