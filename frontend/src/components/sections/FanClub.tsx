"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Check, Crown, Gem, Music2 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fromTo, refreshScrollTrigger } from "@/lib/gsap-safe";

gsap.registerPlugin(ScrollTrigger);

const TIERS: { id: string; name: string; price: string; period: string; accent: string; icon: ReactNode; perks: string[]; featured: boolean }[] = [
  {
    id: "free",
    name: "Free Fan",
    price: "Free",
    period: "",
    accent: "#6b7280",
    icon: <Music2 size={30} strokeWidth={1.4} />,
    perks: [
      "Access to free singles",
      "Exclusive newsletter",
      "Early show announcements",
      "Fan community access",
    ],
    featured: false,
  },
  {
    id: "gold",
    name: "Gold Member",
    price: "$4.99",
    period: "/month",
    accent: "#FFFFFF",
    icon: <Crown size={30} strokeWidth={1.4} />,
    perks: [
      "All Free Fan perks",
      "Early album access (48hrs)",
      "Exclusive demo tracks",
      "Monthly studio Q&A",
      "10% off merch",
      "Digital autograph",
    ],
    featured: true,
  },
  {
    id: "vip",
    name: "VIP Elite",
    price: "$14.99",
    period: "/month",
    accent: "#1DB954",
    icon: <Gem size={30} strokeWidth={1.4} />,
    perks: [
      "All Gold Member perks",
      "Backstage meet & greet (1/year)",
      "Exclusive unreleased music",
      "Personal video shoutout",
      "VIP concert seating",
      "Signed physical album",
      "Producer credits mention",
    ],
    featured: false,
  },
];

export default function FanClub() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [selected, setSelected] = useState("gold");

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
        section.querySelectorAll(".tier-card"),
        { y: 80, opacity: 0, scale: 0.92 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.8,
          stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 70%", once: true },
        }
      );
      refreshScrollTrigger();
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="fan-club"
      className="snap-section relative flex flex-col items-center justify-center bg-transparent px-6 lg:px-16 py-16 overflow-hidden"
    >
      {/* BG */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(10,15,46,0.8) 0%, #000 100%)",
        }}
      />
      <div
        className="ambient-blob absolute"
        style={{
          width: 600, height: 600,
          background: "radial-gradient(circle, #1DB954, transparent)",
          top: "-10%", left: "-10%", opacity: 0.06,
        }}
      />

      <div className="relative w-full max-w-[1200px] mx-auto z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-3">
            Community
          </p>
          <h2
            ref={titleRef}
            className="text-section-title font-display text-white opacity-0"
          >
            FAN <span className="text-purple-gradient">CLUB</span>
          </h2>
          <p className="text-white/40 text-sm mt-4 max-w-md mx-auto">
            Join the Tytan Takuba family. Get exclusive access to music, events, and the artist himself.
          </p>
          <div className="section-divider mt-6 w-32 mx-auto" />
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`tier-card opacity-0 membership-card rounded-2xl p-6 flex flex-col ${
                tier.featured ? "featured" : ""
              }`}
              style={{
                transform: tier.featured ? "scale(1.04)" : "scale(1)",
              }}
            >
              {tier.featured && (
                <div
                  className="text-center mb-4 py-1.5 rounded-full text-xs uppercase tracking-widest"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "var(--gold)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    fontFamily: "var(--font-bebas)",
                    letterSpacing: "0.2em",
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Icon + tier name */}
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]" style={{ color: tier.accent }}>{tier.icon}</span>
                <div>
                  <h3
                    className="font-display text-2xl"
                    style={{ color: tier.accent }}
                  >
                    {tier.name}
                  </h3>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span
                  className="font-display text-4xl"
                  style={{ color: tier.accent }}
                >
                  {tier.price}
                </span>
                <span className="text-white/30 text-sm ml-1">{tier.period}</span>
              </div>

              {/* Perks */}
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-white/60">
                    <span
                      className="mt-0.5 flex-shrink-0 text-xs"
                      style={{ color: tier.accent }}
                    >
                      <Check size={14} strokeWidth={2} />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => setSelected(tier.id)}
                className="w-full py-3 rounded-full font-bold capitalize transition-all duration-300 hover:scale-103"
                style={
                  selected === tier.id
                    ? {
                        background: "#ffffff",
                        color: "#000000",
                        boxShadow: "0 8px 30px rgba(255, 255, 255, 0.25)",
                        fontFamily: "var(--font-sans), sans-serif",
                      }
                    : {
                        background: "transparent",
                        color: "#ffffff",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        fontFamily: "var(--font-sans), sans-serif",
                      }
                }
              >
                {tier.id === "free" ? "Join Free" : `Join ${tier.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div
          className="mt-10 p-5 rounded-xl text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p className="text-white/40 text-sm italic">
            &ldquo;Being a Gold Member gives me access to demos and Q&As that no one else gets. Worth every cent.&rdquo;
          </p>
          <p className="text-white/20 text-xs mt-2 tracking-widest uppercase">
            — @fan_kenzy · Gold Member
          </p>
        </div>
      </div>
    </section>
  );
}
