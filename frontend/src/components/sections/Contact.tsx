"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Apple, AtSign, Camera, CirclePlay, Clapperboard, Download, Globe2, LoaderCircle, Mail, Music2, Phone, Send } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fromTo, refreshScrollTrigger } from "@/lib/gsap-safe";

gsap.registerPlugin(ScrollTrigger);

const INQUIRY_TYPES = ["General Inquiry", "Booking / Shows", "Press / Media", "Collaboration", "Licensing", "Fan Mail"];

const SOCIAL: { label: string; handle: string; icon: ReactNode; url: string }[] = [
  { label: "Instagram", handle: "@tytantakuba", icon: <Camera size={18} strokeWidth={1.6} />, url: "#" },
  { label: "YouTube", handle: "@TytanTakuba", icon: <CirclePlay size={18} strokeWidth={1.6} />, url: "#" },
  { label: "Spotify", handle: "Tytan Takuba", icon: <Music2 size={18} strokeWidth={1.6} />, url: "#" },
  { label: "Twitter / X", handle: "@tytantakuba", icon: <AtSign size={18} strokeWidth={1.6} />, url: "#" },
  { label: "TikTok", handle: "@tytantakuba", icon: <Clapperboard size={18} strokeWidth={1.6} />, url: "#" },
  { label: "Apple Music", handle: "Tytan Takuba", icon: <Apple size={18} strokeWidth={1.6} />, url: "#" },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [form, setForm] = useState({ name: "", email: "", type: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      fromTo(titleRef.current, { y: 80, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 80%", once: true },
      });
      fromTo(section.querySelectorAll(".contact-reveal"), { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });
      refreshScrollTrigger();
    }, section);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1500)); // Simulate API call
    setSending(false);
    setSent(true);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="snap-section relative flex flex-col items-center justify-center bg-transparent px-6 lg:px-16 py-16 overflow-hidden"
    >
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,255,255,0.04) 0%, transparent 60%)",
      }} />
      <div className="ambient-blob absolute" style={{
        width: 500, height: 500,
        background: "radial-gradient(circle, #FFFFFF, transparent)",
        bottom: "-20%", right: "-10%", opacity: 0.05,
      }} />

      <div className="relative w-full max-w-[1400px] mx-auto z-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-3">Get In Touch</p>
          <h2 ref={titleRef} className="text-section-title font-display text-white opacity-0">
            CONTACT <span className="text-gold-gradient">& BOOKING</span>
          </h2>
          <div className="section-divider mt-4 w-32" />
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left: Form */}
          <div className="lg:col-span-3 contact-reveal opacity-0">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4 glass-card rounded-2xl p-8"
                style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                <Mail size={52} strokeWidth={1.3} className="text-gold" />
                <h3 className="font-display text-3xl text-gold">Message Sent!</h3>
                <p className="text-white/40 text-sm text-center">
                  Thanks for reaching out. Tytan&apos;s team will get back to you within 48 hours.
                </p>
                <button onClick={() => { setSent(false); setForm({ name:"", email:"", type:"", message:"" }); }}
                  className="btn-outline-gold text-xs py-2 px-5 mt-2">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/30 text-xs tracking-widest uppercase block mb-1.5">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-white/30 text-xs tracking-widest uppercase block mb-1.5">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/30 text-xs tracking-widest uppercase block mb-1.5">Inquiry Type</label>
                  <select
                    className="form-input"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    required
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <option value="" disabled>Select inquiry type</option>
                    {INQUIRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-white/30 text-xs tracking-widest uppercase block mb-1.5">Message</label>
                  <textarea
                    className="form-input resize-none"
                    rows={5}
                    placeholder="Tell us about your inquiry..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2"
                  disabled={sending}
                >
                  {sending ? (
                    <><LoaderCircle size={17} strokeWidth={1.8} className="animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={17} strokeWidth={1.8} /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right: Info + Social */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Booking info */}
            <div className="contact-reveal opacity-0 glass-card p-5 rounded-xl"
              style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
              <h3 className="font-display text-xl text-gold mb-3 tracking-wide">BOOKING INFO</h3>
              <div className="flex flex-col gap-2 text-sm text-white/50">
                <p className="flex items-center gap-2"><Mail size={15} strokeWidth={1.7} className="text-gold/70" /> bookings@tytantakuba.com</p>
                <p className="flex items-center gap-2"><Phone size={15} strokeWidth={1.7} className="text-gold/70" /> +1 (555) 000-TYTAN</p>
                <p className="flex items-center gap-2"><Globe2 size={15} strokeWidth={1.7} className="text-gold/70" /> Worldwide bookings accepted</p>
                <p className="text-white/30 text-xs mt-2">
                  Response time: 24–48 business hours
                </p>
              </div>
            </div>

            {/* Social links */}
            <div className="contact-reveal opacity-0">
              <h3 className="font-display text-xl text-white mb-4 tracking-wide">FOLLOW TYTAN</h3>
              <div className="grid grid-cols-2 gap-2">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    className="glass-card flex items-center gap-2.5 p-3 rounded-lg transition-all duration-300 hover:border-gold/20 group"
                    style={{ border: "1px solid rgba(255,255,255,0.05)", textDecoration: "none" }}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gold/80 group-hover:text-gold transition-colors">{s.icon}</span>
                    <div className="min-w-0">
                      <p className="text-white/60 text-xs group-hover:text-white transition-colors truncate">
                        {s.label}
                      </p>
                      <p className="text-white/30 text-[10px] truncate">{s.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Press kit */}
            <div className="contact-reveal opacity-0 glass-card p-4 rounded-xl"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white text-sm font-medium">Press Kit</h4>
                  <p className="text-white/30 text-xs mt-0.5">Hi-res photos, bio & assets</p>
                </div>
                <button className="btn-outline-white text-xs py-2 px-4 inline-flex items-center gap-2"><Download size={14} strokeWidth={1.8} /> Download</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
