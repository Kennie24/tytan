"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const progress = progressRef.current;
    const text = textRef.current;
    const subtitle = subtitleRef.current;
    const percent = percentRef.current;
    if (!el || !progress || !text || !subtitle || !percent) return;

    // Prevent body scroll during loading
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
      },
    });

    // Initial state
    gsap.set([text, subtitle], { opacity: 0, y: 30 });
    gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

    tl.to(text, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.2)
      .to(subtitle, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.5)
      .to(
        progress,
        {
          scaleX: 1,
          duration: 1.8,
          ease: "power2.inOut",
          onUpdate: function () {
            const val = Math.round(this.progress() * 100);
            if (percent) percent.textContent = val + "%";
          },
        },
        0.6
      )
      .to(
        el,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.9,
          ease: "power4.inOut",
          delay: 0.2,
        },
        "+=0.3"
      )
      .set(el, { display: "none" });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="loading-screen"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      {/* Ambient blobs */}
      <div
        className="ambient-blob"
        style={{
          width: 400,
          height: 400,
          background: "#FFFFFF",
          top: "20%",
          left: "30%",
          opacity: 0.08,
        }}
      />
      <div
        className="ambient-blob"
        style={{
          width: 300,
          height: 300,
          background: "#1DB954",
          bottom: "25%",
          right: "25%",
          opacity: 0.08,
          animationDelay: "2s",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-8">
        <div ref={textRef}>
          <h1
            className="font-display text-gold-gradient"
            style={{ fontSize: "clamp(4rem, 14vw, 18rem)", lineHeight: 0.88 }}
          >
            TYTAN
          </h1>
          <h1
            className="font-display text-gold-gradient"
            style={{ fontSize: "clamp(4rem, 14vw, 18rem)", lineHeight: 0.88 }}
          >
            TAKUBA
          </h1>
        </div>

        <p
          ref={subtitleRef}
          className="text-white/40 tracking-[0.4em] text-xs uppercase mt-6 mb-10"
        >
          Big Sound. Bigger Story.
        </p>

        {/* Progress */}
        <div className="w-48 mx-auto">
          <div className="progress-bar-container h-[2px] mb-2">
            <div
              ref={progressRef}
              className="progress-bar-fill h-full"
              style={{ width: "100%" }}
            />
          </div>
          <span
            ref={percentRef}
            className="text-white/30 text-xs tracking-widest"
          >
            0%
          </span>
        </div>
      </div>
    </div>
  );
}
