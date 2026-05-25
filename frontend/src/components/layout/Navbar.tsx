"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";

const navLinks = [
  { label: "Music", href: "#music" },
  { label: "Albums", href: "#albums" },
  { label: "Videos", href: "#videos" },
  { label: "About", href: "#about" },
  { label: "Tour", href: "#tour" },
  { label: "Merch", href: "#merch" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Slide-in animation on mount
    gsap.fromTo(
      nav,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 2.8 }
    );

    // Scroll listener for glass effect
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(0,0,0,0.85)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.06)"
            : "none",
        }}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-gold-gradient text-2xl lg:text-3xl tracking-wider hover:opacity-80 transition-opacity"
          >
            TT
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className="text-white/60 hover:text-white text-xs tracking-[0.15em] uppercase transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#1DB954] group-hover:w-full transition-all duration-300" />
                </button>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              className="btn-gold text-xs py-2 px-5"
              style={{
                borderRadius: "9999px",
                background: "#1DB954",
                color: "#000",
                fontFamily: "var(--font-sans), sans-serif",
                fontWeight: "700",
                textTransform: "capitalize",
                letterSpacing: "0.12em",
                clipPath: "none"
              }}
            >
              Buy Album
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-6 h-0.5 bg-white transition-all duration-300"
              style={{
                transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "",
              }}
            />
            <span
              className="block w-4 h-0.5 bg-white transition-all duration-300"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-6 h-0.5 bg-white transition-all duration-300"
              style={{
                transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-all duration-500 lg:hidden"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
        }}
      >
        {navLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => handleNavClick(link.href)}
            className="font-display text-4xl text-white/80 hover:text-[#1DB954] tracking-widest transition-colors duration-300"
          >
            {link.label}
          </button>
        ))}
        <button 
          className="btn-gold mt-4"
          style={{
            borderRadius: "9999px",
            background: "#1DB954",
            color: "#000",
            fontFamily: "var(--font-sans), sans-serif",
            fontWeight: "700",
            textTransform: "capitalize",
            letterSpacing: "0.12em",
            clipPath: "none"
          }}
        >
          Buy Album
        </button>
      </div>
    </>
  );
}
