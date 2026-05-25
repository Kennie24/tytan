"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, Music2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fromTo, refreshScrollTrigger } from "@/lib/gsap-safe";

gsap.registerPlugin(ScrollTrigger);

const TRACKS = [
  { id: 1, title: "Midnight Throne", album: "Dark Frequencies", dur: "3:42", totalSec: 222, price: "$1.29" },
  { id: 2, title: "Electric Soul", album: "Dark Frequencies", dur: "4:11", totalSec: 251, price: "$1.29" },
  { id: 3, title: "Dark Frequencies", album: "Dark Frequencies", dur: "5:02", totalSec: 302, price: "$1.49" },
  { id: 4, title: "War Cry", album: "Rise of Tytan", dur: "4:28", totalSec: 268, price: "$1.29" },
  { id: 5, title: "Golden Era", album: "Rise of Tytan", dur: "3:55", totalSec: 235, price: "$1.29" },
  { id: 6, title: "Blueprint", album: "Sonic Blueprint", dur: "3:30", totalSec: 210, price: "$0.99" },
];

const BAR_COUNT = 40;

export default function MusicPlayer() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const barsRef = useRef<number[]>(Array(BAR_COUNT).fill(0.3));
  const rafRef = useRef<number | null>(null);

  // Waveform canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const barW = W / BAR_COUNT - 2;

      barsRef.current.forEach((h, i) => {
        if (playing) {
          barsRef.current[i] = Math.max(
            0.1,
            Math.min(1, h + (Math.random() - 0.5) * 0.3)
          );
        }
        const barH = (barsRef.current[i] * H * 0.8);
        const x = i * (barW + 2);
        const y = (H - barH) / 2;
        const fraction = i / BAR_COUNT;
        const isPlayed = fraction <= progress / 100;

        const gradient = ctx.createLinearGradient(x, y, x, y + barH);
        if (isPlayed) {
          gradient.addColorStop(0, "#FFFFFF");
          gradient.addColorStop(1, "#1DB954");
        } else {
          gradient.addColorStop(0, "rgba(255,255,255,0.08)");
          gradient.addColorStop(1, "rgba(255,255,255,0.04)");
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, progress]);

  // Progress timer
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setActiveTrack((t) => (t + 1) % TRACKS.length);
            return 0;
          }
          return p + 100 / (TRACKS[activeTrack].totalSec * 5);
        });
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, activeTrack]);

  // GSAP entrance
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      fromTo(
        titleRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 80%", once: true },
        }
      );
      fromTo(
        section.querySelectorAll(".player-animate"),
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 70%", once: true },
        }
      );
      refreshScrollTrigger();
    }, section);
    return () => ctx.revert();
  }, []);

  const track = TRACKS[activeTrack];
  const elapsed = Math.floor((progress / 100) * track.totalSec);
  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <section
      ref={sectionRef}
      id="music"
      className="snap-section relative flex flex-col items-center justify-center bg-transparent px-6 lg:px-16 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(8,8,30,1) 0%, #000 60%)",
      }}
    >
      {/* BG decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(139,92,246,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-5 gap-10">
        {/* Left — player */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Header */}
          <div className="mb-8 player-animate opacity-0">
            <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-3">
              Experience
            </p>
            <h2
              ref={titleRef}
              className="text-section-title font-display text-white opacity-0"
            >
              MUSIC <span className="text-gold-gradient">PLAYER</span>
            </h2>
            <div className="section-divider mt-4 w-32" />
          </div>

          {/* Now playing */}
          <div
            className="glass-card rounded-2xl p-6 player-animate opacity-0"
            style={{ 
              border: "1.5px solid #1DB954",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(29, 185, 84, 0.15)"
            }}
          >
            {/* Track info */}
            <div className="flex items-center gap-5 mb-6">
              <div
                className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center text-4xl relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #1a0a3e 0%, #0d0620 100%)",
                  boxShadow: "0 8px 40px rgba(139,92,246,0.3)",
                }}
              >
                <Music2 size={38} strokeWidth={1.4} className="text-gold" />
                {playing && (
                  <div
                    className="absolute inset-0 rounded-xl border-2 border-gold/30 vinyl-spin"
                    style={{ borderRadius: "50%", width: "80%", height: "80%", margin: "auto", top: 0, bottom: 0, left: 0, right: 0, position: "absolute" }}
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">
                  {track.title}
                </h3>
                <p className="text-white/40 text-sm mt-0.5">{track.album}</p>
                <p
                  className="text-xs mt-1 font-medium"
                  style={{ color: "var(--gold)" }}
                >
                  {track.price} · Buy single
                </p>
              </div>
              {/* EQ Visualiser */}
              {playing && (
                <div className="flex items-end gap-0.5 h-8">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full eq-bar-${i}`}
                      style={{ background: "#1DB954" }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Waveform */}
            <canvas
              ref={canvasRef}
              className="w-full h-14 rounded-lg cursor-pointer mb-4"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress(((e.clientX - rect.left) / rect.width) * 100);
              }}
            />

            {/* Progress */}
            <div className="flex justify-between text-xs text-white/30 mb-3">
              <span>{fmt(elapsed)}</span>
              <span>{track.dur}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                className="text-white/40 hover:text-white transition-colors text-xl"
                onClick={() => {
                  setActiveTrack((t) => (t - 1 + TRACKS.length) % TRACKS.length);
                  setProgress(0);
                }}
              >
                <SkipBack size={22} strokeWidth={1.8} />
              </button>
              <button
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{
                  background: "#1DB954",
                  boxShadow: "0 0 30px rgba(29, 185, 84, 0.4)",
                }}
                onClick={() => setPlaying(!playing)}
              >
                <span className="text-black text-xl">
                  {playing ? <Pause size={22} strokeWidth={2} fill="currentColor" /> : <Play size={22} strokeWidth={2} fill="currentColor" />}
                </span>
              </button>
              <button
                className="text-white/40 hover:text-white transition-colors text-xl"
                onClick={() => {
                  setActiveTrack((t) => (t + 1) % TRACKS.length);
                  setProgress(0);
                }}
              >
                <SkipForward size={22} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        {/* Right — track list */}
        <div className="lg:col-span-2 flex flex-col justify-center player-animate opacity-0">
          <h3 className="font-display text-2xl text-white mb-4 tracking-wide">
            ALL TRACKS
          </h3>
          <div className="flex flex-col overflow-y-auto max-h-[50vh]">
            {TRACKS.map((t, i) => (
              <div
                key={t.id}
                onClick={() => { setActiveTrack(i); setProgress(0); }}
                className={`track-row flex items-center gap-3 py-3 px-3 cursor-pointer ${
                  activeTrack === i ? "bg-white/5 border-l-2 border-[#1DB954]" : ""
                }`}
              >
                <span className="text-white/20 text-xs w-5 text-right">
                  {activeTrack === i && playing ? (
                    <AudioLines size={14} strokeWidth={1.8} className="text-[#1DB954]" />
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate transition-colors ${activeTrack === i ? "text-white" : "text-white/60"}`}>
                    {t.title}
                  </p>
                  <p className="text-white/30 text-xs truncate">{t.album}</p>
                </div>
                <span className="text-white/30 text-xs flex-shrink-0">{t.dur}</span>
                <button
                  className="text-xs flex-shrink-0 py-1 px-2 rounded border transition-colors hover:bg-gold/10"
                  style={{ borderColor: "rgba(255,255,255,0.3)", color: "var(--gold)" }}
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  {t.price}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
