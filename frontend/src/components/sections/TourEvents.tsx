"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { eventsApi, type Event } from "@/lib/api";
import { fromTo, refreshScrollTrigger } from "@/lib/gsap-safe";

gsap.registerPlugin(ScrollTrigger);

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  "on-sale":      { label: "On Sale",          color: "#22c55e" },
  "almost-sold":  { label: "Almost Sold Out",  color: "#f59e0b" },
  "sold-out":     { label: "Sold Out",          color: "#ef4444" },
  "coming-soon":  { label: "Coming Soon",       color: "#6b7280" },
  "cancelled":    { label: "Cancelled",         color: "#6b7280" },
};

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day   = d.getDate().toString().padStart(2, "0");
  const year  = d.getFullYear();
  return { month, day: `${month} ${day}`, dayNum: day, year: year.toString() };
}

function formatPrice(price: string | null) {
  if (!price) return "TBA";
  return `$${parseFloat(price).toFixed(0)}`;
}

export default function TourEvents() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);

  const [events,  setEvents]  = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.list()
      .then((res) => setEvents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      fromTo(titleRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 80%", once: true } }
      );
      fromTo(section.querySelectorAll(".event-row"),
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 70%", once: true } }
      );
      refreshScrollTrigger();
    }, section);
    return () => ctx.revert();
  }, [loading, events]);

  return (
    <section
      ref={sectionRef}
      id="tour"
      className="snap-section relative flex flex-col items-center justify-center px-6 lg:px-16 py-16 overflow-hidden"
      style={{ backgroundColor: "#CEF56A" }}
    >

      {/* Tour marquee BG */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 overflow-hidden pointer-events-none opacity-[0.025]">
        <div className="marquee-track font-display text-white" style={{ fontSize: "clamp(5rem,15vw,20rem)" }}>
          {Array(3).fill("WORLD TOUR · ").map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10">
          <div>
            <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-3">Live Shows</p>
            <h2 ref={titleRef} className="text-section-title font-display text-white opacity-0">
              WORLD <span className="text-gold-gradient">TOUR</span>
            </h2>
            <div className="section-divider mt-4 w-32" />
          </div>
          {!loading && events.length > 0 && (
            <div className="mt-4 lg:mt-0 px-5 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <p className="text-gold text-sm font-medium">{events.length} Shows Announced</p>
              <p className="text-white/30 text-xs mt-0.5">More dates to be confirmed</p>
            </div>
          )}
        </div>

        {/* Events list */}
        {loading ? (
          <div className="flex flex-col gap-0 animate-pulse">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="h-20 border-b border-white/5 bg-white/[0.02] rounded mb-1" />
            ))}
          </div>
        ) : !events.length ? (
          <p className="text-white/30 text-center py-12">No upcoming shows announced yet. Check back soon.</p>
        ) : (
          <div className="flex flex-col">
            {events.map((event) => {
              const status  = STATUS_MAP[event.status] ?? STATUS_MAP["coming-soon"];
              const { dayNum, month, year } = formatEventDate(event.event_date);
              const canBuy  = event.status === "on-sale" || event.status === "almost-sold";

              return (
                <div
                  key={event.id}
                  className="event-row opacity-0 flex items-center gap-4 lg:gap-8 py-5 px-4 lg:px-6 group cursor-pointer rounded-lg transition-all duration-300"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {/* Date */}
                  <div className="flex-shrink-0 text-center min-w-[3rem]">
                    <p className="font-display text-2xl text-gold leading-none">{dayNum}</p>
                    <p className="font-display text-sm text-white/30">{month}</p>
                    <p className="text-white/20 text-[10px]">{year}</p>
                  </div>

                  <div className="w-px h-10 bg-white/10 flex-shrink-0 hidden lg:block" />

                  {/* Location */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl lg:text-2xl text-white group-hover:text-gold transition-colors tracking-wide">
                      {event.city}
                    </h3>
                    <p className="text-white/40 text-sm truncate">
                      {event.venue} · {event.country}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full"
                      style={{ background: status.color, boxShadow: `0 0 8px ${status.color}` }} />
                    <span className="text-xs" style={{ color: status.color }}>{status.label}</span>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-white/50 text-sm hidden sm:block">
                      {formatPrice(event.ticket_price)}
                    </span>
                    {canBuy && event.ticket_url ? (
                      <a
                        href={event.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-gold text-xs py-2 px-4"
                      >
                        Get Tickets
                      </a>
                    ) : (
                      <button
                        className="btn-outline-white text-xs py-2 px-4 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        {event.status === "sold-out" ? "Sold Out" :
                         event.status === "cancelled" ? "Cancelled" : "Notify Me"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
