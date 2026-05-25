"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { Music2, Play } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { albumsApi, type Album } from "@/lib/api";
import { fromTo, refreshScrollTrigger } from "@/lib/gsap-safe";

gsap.registerPlugin(ScrollTrigger);

// Per-album accent colours (fallback palette keyed by index)
const ACCENTS = ["#1DB954", "#FFFFFF", "#3B82F6", "#EC4899"];
const BG_GRADIENTS = [
  "linear-gradient(135deg,#0a1a11 0%,#050d08 60%,#0a1a11 100%)",
  "linear-gradient(135deg,#3a1a00 0%,#1a0a00 60%,#2a1200 100%)",
  "linear-gradient(135deg,#001a3a 0%,#000d20 60%,#001a3a 100%)",
  "linear-gradient(135deg,#1a001a 0%,#0d000d 60%,#1a001a 100%)",
];

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "–:––";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function Skeleton() {
  return (
    <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-10 items-start animate-pulse">
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-card p-5 rounded-lg h-24 bg-white/5" />
        ))}
      </div>
      <div className="glass-card rounded-xl overflow-hidden h-[480px] bg-white/5" />
    </div>
  );
}

export default function AlbumShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);

  const [albums,  setAlbums]  = useState<Album[]>([]);
  const [active,  setActive]  = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Fetch albums ───────────────────────────────────────────────────────────
  useEffect(() => {
    albumsApi.list()
      .then((res) => { setAlbums(res.data); })
      .catch(() => {/* keep empty, component shows nothing */})
      .finally(() => setLoading(false));
  }, []);

  // ── GSAP animations ────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !albums.length) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      fromTo(titleRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 80%", once: true } }
      );
      if (cardsRef.current) {
        fromTo(
          cardsRef.current.querySelectorAll(".album-card-item"),
          { y: 100, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.15, ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 75%", once: true } }
        );
        }
      refreshScrollTrigger();
      }, section);
    return () => ctx.revert();
  }, [loading, albums]);

  const album  = albums[active];
  const accent = ACCENTS[active % ACCENTS.length];
  const bg     = BG_GRADIENTS[active % BG_GRADIENTS.length];

  return (
    <section
      ref={sectionRef}
      id="albums"
      className="snap-section relative flex flex-col items-center justify-center bg-transparent px-6 lg:px-16 py-16 overflow-hidden"
    >
      {/* Ambient BG */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(29,185,84,0.08) 0%, transparent 60%)",
      }} />

      {/* Header */}
      <div className="w-full max-w-[1400px] mx-auto mb-10">
        <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-3">Discography</p>
        <h2 ref={titleRef} className="text-section-title font-display text-white opacity-0">
          LATEST <span className="text-gold-gradient">ALBUMS</span>
        </h2>
        <div className="section-divider mt-4 w-32" />
      </div>

      {loading ? <Skeleton /> : !albums.length ? (
        <p className="text-white/30 text-center">No albums available yet.</p>
      ) : (
        <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-10 items-start">

          {/* Album selector cards */}
          <div ref={cardsRef} className="flex flex-col gap-4">
            {albums.map((alb, i) => {
              const ac = ACCENTS[i % ACCENTS.length];
              const abg = BG_GRADIENTS[i % BG_GRADIENTS.length];
              return (
                <div
                  key={alb.id}
                  className={`album-card-item opacity-0 glass-card p-5 cursor-pointer transition-all duration-500 rounded-lg`}
                  style={{
                    border: `1px solid ${active === i ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.05)"}`,
                    boxShadow: active === i ? `0 0 40px ${ac}22` : "none",
                  }}
                  onClick={() => setActive(i)}
                >
                  <div className="flex items-center gap-5">
                    {/* Cover art */}
                    <div
                      className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden"
                      style={{ background: abg, boxShadow: `0 8px 24px ${ac}33` }}
                    >
                      {alb.cover_art_url ? (
                        <img
                          src={alb.cover_art_url}
                          alt={alb.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Music2 size={24} strokeWidth={1.35} className="text-gold/80" /></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-white text-xl tracking-wide truncate">{alb.title}</h3>
                      <p className="text-white/40 text-xs mt-0.5 tracking-widest uppercase">
                        {alb.release_date ? alb.release_date.slice(0, 4) : "–"}
                        {" · "}
                        {alb.songs_count ?? (alb.songs?.length ?? 0)} Tracks
                        {alb.genre ? ` · ${alb.genre}` : ""}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-display text-xl" style={{ color: ac }}>
                        ${parseFloat(alb.price).toFixed(2)}
                      </p>
                      <p className="text-white/30 text-xs mt-0.5 uppercase tracking-wider">
                        {alb.type}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active album detail panel */}
          {album && (
            <div
              className="glass-card rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.5s ease" }}
            >
              {/* Cover art hero */}
              <div className="relative h-64 flex items-center justify-center overflow-hidden" style={{ background: bg }}>
                {album.cover_art_url ? (
                  <>
                    <img
                      src={album.cover_art_url}
                      alt={album.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0" style={{
                      background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)",
                    }} />
                  </>
                ) : (
                  <>
                    <div className="absolute w-48 h-48 rounded-full border border-white/5"
                      style={{ boxShadow: `0 0 60px ${accent}30` }} />
                    <div className="absolute w-32 h-32 rounded-full border border-white/5" />
                      <Music2 size={78} strokeWidth={1.15} className="relative z-10 float-1 text-gold/80" />
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)" }} />
                  </>
                )}

                <div className="absolute bottom-4 left-5 right-5 z-10">
                  <h3 className="font-display text-3xl text-white drop-shadow">{album.title}</h3>
                  <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: accent }}>
                    {album.release_date?.slice(0, 4) ?? "–"} · Tytan Takuba
                    {album.genre ? ` · ${album.genre}` : ""}
                  </p>
                </div>
              </div>

              {/* Tracklist */}
              <div className="p-5">
                {album.description && (
                  <p className="text-white/40 text-sm mb-4 leading-relaxed line-clamp-2">
                    {album.description}
                  </p>
                )}
                <h4 className="text-white/40 text-xs tracking-[0.3em] uppercase mb-3">Tracklist Preview</h4>
                <div className="flex flex-col">
                  {(album.songs ?? []).slice(0, 5).map((t) => (
                    <div key={t.id}
                      className="track-row flex items-center gap-3 py-3 px-1 group cursor-pointer">
                      <span className="text-white/20 text-xs w-5 text-right group-hover:text-gold transition-colors">
                        {t.track_number}
                      </span>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(255,255,255,0.1)" }}><Play size={10} strokeWidth={2} fill="currentColor" className="text-gold" /></div>
                      <span className="flex-1 text-white/70 text-sm group-hover:text-white transition-colors">
                        {t.title}
                      </span>
                      <span className="text-white/30 text-xs">
                        {formatDuration(t.duration_seconds ?? t.duration)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-5">
                  <button className="btn-gold flex-1 py-3 text-sm"
                    onClick={() => document.querySelector("#store")?.scrollIntoView({ behavior: "smooth" })}>
                    Buy ${parseFloat(album.price).toFixed(2)}
                  </button>
                  <button className="btn-outline-white flex-1 py-3 text-sm inline-flex items-center justify-center gap-2">
                    Preview <Play size={14} strokeWidth={2} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
