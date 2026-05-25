"use client";

import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const particlesRef = useRef<HTMLCanvasElement>(null);

  // Particles
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string;
    }[] = [];

    const colors = ["#FFFFFF", "#1DB954", "#3B82F6", "#ffffff"];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // GSAP animations
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Initial entrance animation
      const tl = gsap.timeline({ delay: 3.0 });

      // Background parallax
      if (bgRef.current) {
        tl.fromTo(
          bgRef.current,
          { scale: 1.15, opacity: 0 },
          { scale: 1.05, opacity: 1, duration: 1.8, ease: "power2.out" },
          0
        );
      }

      // Title entrance animation
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
          },
          0.3
        );
      }

      // Subtitle
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { y: 40, opacity: 0, letterSpacing: "0.8em" },
          {
            y: 0,
            opacity: 1,
            letterSpacing: "0.3em",
            duration: 1,
            ease: "power3.out",
          },
          0.9
        );
      }

      // CTA buttons
      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
          },
          1.2
        );
      }

      // Scroll indicator
      if (scrollIndRef.current) {
        tl.fromTo(
          scrollIndRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          1.6
        );
      }



      // Scroll-driven parallax on background
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          y: "30%",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="snap-section relative flex items-center justify-center overflow-hidden bg-transparent"
    >
      {/* Particles canvas */}
      <canvas
        ref={particlesRef}
        id="particles-canvas"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Background with cinematic gradient */}
      <div
        ref={bgRef}
        className="absolute inset-0 opacity-0"
        style={{ zIndex: 0 }}
      >
        {/* Gradient layers */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(139,92,246,0.25) 0%, transparent 60%), " +
              "radial-gradient(ellipse 60% 50% at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 60%), " +
              "radial-gradient(ellipse 50% 60% at 10% 80%, rgba(59,130,246,0.12) 0%, transparent 60%), " +
              "linear-gradient(180deg, #000 0%, #050510 40%, #0a0515 70%, #000 100%)",
          }}
        />
        {/* Scanlines effect */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 3px)",
          }}
        />
      </div>

      {/* Ambient light blobs */}
      <div
        className="ambient-blob"
        style={{
          width: 600, height: 600,
          background: "radial-gradient(circle, #1DB954, transparent)",
          top: "-10%", left: "-5%", zIndex: 0,
        }}
      />
      <div
        className="ambient-blob"
        style={{
          width: 500, height: 500,
          background: "radial-gradient(circle, #FFFFFF, transparent)",
          bottom: "5%", right: "10%",
          animationDelay: "3s", zIndex: 0,
        }}
      />
      <div
        className="ambient-blob"
        style={{
          width: 400, height: 400,
          background: "radial-gradient(circle, #3B82F6, transparent)",
          top: "30%", right: "-5%",
          animationDelay: "1.5s", zIndex: 0,
        }}
      />



      {/* Main content */}
      <div
        className="relative text-center px-6 max-w-[1400px] mx-auto w-full"
        style={{ zIndex: 5 }}
      >
        {/* Pre-title */}
        <div className="mb-4">
          <span
            className="text-white/30 tracking-[0.5em] text-xs uppercase"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Official Artist
          </span>
        </div>

        {/* GIANT TITLE */}
        <h1
          ref={titleRef}
          className="text-hero font-display text-white"
          style={{
            textShadow:
              "0 0 120px rgba(255,255,255,0.15), 0 0 60px rgba(139,92,246,0.1)",
            perspective: "1000px",
          }}
        >
          TYTAN TAKUBA
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-white/50 mt-4 mb-10"
          style={{
            fontSize: "clamp(0.7rem, 2vw, 1rem)",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontFamily: "var(--font-inter)",
          }}
        >
          Big Sound. Bigger Story.
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            className="btn-gold flex items-center gap-2"
            onClick={() => {
              document.querySelector("#music")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Play size={18} strokeWidth={1.8} fill="currentColor" /> Listen Now
          </button>
          <button
            className="btn-outline-gold"
            onClick={() => {
              document.querySelector("#albums")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Buy Album
          </button>
          <button
            className="btn-outline-white"
            onClick={() => {
              document.querySelector("#videos")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Watch Videos
          </button>
        </div>

        {/* Marquee strip */}
        <div
          className="mt-16 overflow-hidden opacity-20"
          style={{ position: "relative" }}
        >
          <div className="marquee-track text-marquee text-white/20 font-display">
            {Array(4).fill("TYTAN TAKUBA · BIG SOUND · BIGGER STORY · ").map((t, i) => (
              <span key={i} className="mr-8">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndRef}
        className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
        style={{ zIndex: 5 }}
      >
        <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase">
          Scroll
        </span>
        <div
          className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1.5"
        >
          <div
            className="w-1 h-2 rounded-full bg-gold scroll-indicator"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
      </div>
    </section>
  );
}
