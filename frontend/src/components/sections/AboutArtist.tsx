"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { fromTo, refreshScrollTrigger } from "@/lib/gsap-safe";

gsap.registerPlugin(ScrollTrigger, SplitText);

const STATS = [
  { n: "3", label: "Studio Albums" },
  { n: "36", label: "Tracks Released" },
  { n: "7.8M", label: "Total Streams" },
  { n: "12", label: "Countries Toured" },
];

export default function AboutArtist() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      // Parallax bg text
      fromTo(
        section.querySelector(".bg-name"),
        { x: "-5%" },
        {
          x: "5%",
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 },
        }
      );

      // Content reveal
      fromTo(
        section.querySelectorAll(".about-reveal"),
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 75%", once: true },
        }
      );

      // Stats count-up
      if (statsRef.current) {
          fromTo(
            statsRef.current.querySelectorAll(".stat-num"),
          { opacity: 0, scale: 0.5, y: 20 },
          {
            opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "back.out(1.7)",
            scrollTrigger: { trigger: statsRef.current, start: "top 80%", once: true },
          }
        );
      }
      refreshScrollTrigger();
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="snap-section relative flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Giant BG name */}
      <div
        className="bg-name absolute font-display text-white select-none pointer-events-none"
        style={{
          fontSize: "clamp(8rem, 22vw, 28rem)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.02,
          whiteSpace: "nowrap",
          letterSpacing: "-0.05em",
        }}
      >
        TYTAN TAKUBA
      </div>

      {/* Ambient - Removed to maintain pure black background */}

      <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-16 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: artist portrait */}
          <div className="about-reveal opacity-0 relative w-full max-w-md lg:max-w-xl xl:max-w-2xl mx-auto lg:mx-0">
            <div
              className="aspect-[3/4] rounded-2xl overflow-hidden relative bg-black"
              style={{
                border: "none",
                boxShadow: "none",
              }}
            >
              <img
                src="/artist-photo.png"
                alt="Tytan Takuba verified artist portrait"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/95" />

              {/* Floating badge */}
              <div
                className="absolute top-6 right-6 glass-card px-4 py-2 rounded-xl"
                style={{ border: "1px solid rgba(255,255,255,0.2)" }}
              >
                <p className="text-gold text-xs tracking-widest uppercase font-display">
                  Verified Artist
                </p>
              </div>

              {/* Bottom info */}
              <div
                className="absolute bottom-0 left-0 right-0 p-6"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)" }}
              >
                <h3 className="font-display text-3xl text-white">TYTAN TAKUBA</h3>
                <p className="text-white/40 text-xs tracking-widest mt-1">
                  Musician · Songwriter · Producer
                </p>
              </div>
            </div>

            {/* Floating stat card */}
            <div
              className="absolute -bottom-6 -right-6 lg:right-auto lg:-right-8 glass-card p-4 rounded-xl hidden lg:block"
              style={{ border: "1px solid rgba(255,255,255,0.15)", minWidth: 160 }}
            >
              <p className="font-display text-gold text-3xl">7.8M</p>
              <p className="text-white/40 text-xs tracking-widest">Total Streams</p>
            </div>
          </div>

          {/* Right: bio */}
          <div className="flex flex-col gap-6">
            <div className="about-reveal opacity-0">
              <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-3">
                The Artist
              </p>
              <h2 className="text-section-title font-display text-white">
                ABOUT <span className="text-gold-gradient">TYTAN</span>
              </h2>
              <div className="section-divider mt-4 w-32" />
            </div>

            {/* Quote */}
            <p
              ref={quoteRef}
              className="about-reveal opacity-0 text-white/60 text-lg leading-relaxed"
              style={{ fontStyle: "italic", borderLeft: "3px solid #1DB954", paddingLeft: "1.5rem" }}
            >
              &ldquo;Music is my language, the stage is my kingdom, and every note I play is a declaration of who I am.&rdquo;
            </p>

            <div className="about-reveal opacity-0 text-white/50 leading-relaxed text-sm space-y-4">
              <p>
                Tytan Takuba is a visionary musician and songwriter whose sound defies boundaries. Born from the raw energy of street beats and shaped by years of studio craft, Tytan blends hip-hop, Afrobeat, and cinematic soundscapes into a genre-defining experience.
              </p>
              <p>
                With three critically acclaimed studio albums and millions of streams worldwide, Tytan has cemented his place as one of the most exciting voices in contemporary music. His performances are more than concerts — they&apos;re events.
              </p>
            </div>

            {/* Stats */}
            <div
              ref={statsRef}
              className="about-reveal opacity-0 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2"
            >
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="glass-card p-4 rounded-xl text-center"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="stat-num opacity-0 font-display text-2xl text-gold">
                    {s.n}
                  </p>
                  <p className="text-white/30 text-[10px] tracking-widest uppercase mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="about-reveal opacity-0 flex gap-3">
              <button
                className="btn-outline-gold text-xs py-2.5 px-5"
                onClick={() => {
                  document.querySelector("#fan-club")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Join Fan Club
              </button>
              <button
                className="btn-outline-white text-xs py-2.5 px-5"
                onClick={() => {
                  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Book Tytan
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
