"use client";

/* eslint-disable @next/next/no-img-element */

import { type ReactNode, useEffect, useRef, useState } from "react";
import { BadgeDollarSign, Banknote, Check, CreditCard, Landmark, Music2, ShoppingCart, Smartphone } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { albumsApi, type Album } from "@/lib/api";
import { fromTo, refreshScrollTrigger } from "@/lib/gsap-safe";

gsap.registerPlugin(ScrollTrigger);

const TYPE_ACCENTS: Record<string, string> = {
  album:  "#1DB954",
  ep:     "#3B82F6",
  single: "#FFFFFF",
};

const PAYMENT_METHODS: { icon: ReactNode; label: string }[] = [
  { icon: <CreditCard size={15} strokeWidth={1.7} />, label: "Visa/Mastercard" },
  { icon: <BadgeDollarSign size={15} strokeWidth={1.7} />, label: "PayPal" },
  { icon: <Smartphone size={15} strokeWidth={1.7} />, label: "Mobile Money" },
  { icon: <Banknote size={15} strokeWidth={1.7} />, label: "Airtel Money" },
  { icon: <Landmark size={15} strokeWidth={1.7} />, label: "Flutterwave" },
];

type CartItem = { id: number; title: string; price: number; type: string };

export default function AlbumsStore() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);

  const [albums,  setAlbums]  = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart,    setCart]    = useState<CartItem[]>([]);
  const [filter,  setFilter]  = useState("all");
  const [toast,   setToast]   = useState("");

  useEffect(() => {
    albumsApi.list()
      .then((res) => setAlbums(res.data))
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
      fromTo(section.querySelectorAll(".store-card"),
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 70%", once: true } }
      );
      refreshScrollTrigger();
    }, section);
    return () => ctx.revert();
  }, [loading, albums, filter]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const addToCart = (album: Album) => {
    const already = cart.some((c) => c.id === album.id);
    if (already) { showToast(`"${album.title}" is already in your cart.`); return; }
    setCart((c) => [...c, { id: album.id, title: album.title, price: parseFloat(album.price), type: album.type }]);
    showToast(`"${album.title}" added to cart!`);
  };

  const cartTotal = cart.reduce((acc, c) => acc + c.price, 0);

  const filtered = filter === "all"
    ? albums
    : albums.filter((a) => a.type === filter);

  return (
    <section
      ref={sectionRef}
      id="store"
      className="snap-section relative flex flex-col items-center justify-center bg-transparent px-6 lg:px-16 py-16 overflow-hidden"
    >
      {/* Ambient BG */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255,255,255,0.06) 0%, transparent 60%)",
      }} />

      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8">
          <div>
            <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-3">Shop</p>
            <h2 ref={titleRef} className="text-section-title font-display text-white opacity-0">
              MUSIC <span className="text-gold-gradient">STORE</span>
            </h2>
            <div className="section-divider mt-4 w-32" />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-6 lg:mt-0">
            {["all", "album", "ep", "single"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs tracking-widest uppercase transition-all duration-200 rounded-full border ${
                  filter === f
                    ? "bg-gold text-black border-gold"
                    : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                }`}
                style={{ fontFamily: "var(--font-bebas)" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Cart bar */}
        {cart.length > 0 && (
          <div className="mb-6 p-3 px-5 rounded-lg flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <span className="text-gold text-sm">
              <ShoppingCart size={15} strokeWidth={1.8} className="inline mr-2 align-[-2px]" /> {cart.length} item{cart.length > 1 ? "s" : ""} — ${cartTotal.toFixed(2)}
            </span>
            <button className="btn-gold text-xs py-1.5 px-4">Checkout</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
            {[0,1,2,3].map(i => <div key={i} className="rounded-xl bg-white/5 h-64" />)}
          </div>
        ) : !filtered.length ? (
          <p className="text-white/30 text-center py-12">
            No {filter !== "all" ? filter + "s" : "releases"} available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((album) => {
              const accent  = TYPE_ACCENTS[album.type] ?? "#1DB954";
              const inCart  = cart.some((c) => c.id === album.id);
              const trackCount = album.songs_count ?? album.songs?.length ?? 0;

              return (
                <div key={album.id}
                  className="store-card opacity-0 glass-card rounded-xl overflow-hidden group"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>

                  {/* Cover art */}
                  <div className="h-44 flex items-center justify-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${accent}22 0%, #000 100%)` }}>

                    {album.cover_art_url ? (
                      <>
                        <img src={album.cover_art_url} alt={album.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </>
                    ) : (
                      <Music2 size={52} strokeWidth={1.25} className="text-gold/80 group-hover:scale-110 transition-transform duration-500 relative z-10" />
                    )}

                    {/* Hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at 50% 50%, ${accent}, transparent 70%)` }} />

                    {/* Type badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest z-10"
                      style={{ background: `${accent}33`, color: accent, border: `1px solid ${accent}44`, fontFamily: "var(--font-bebas)" }}>
                      {album.type}
                    </div>

                    {/* Genre */}
                    {album.genre && (
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[9px] z-10"
                        style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.5)" }}>
                        {album.genre}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-display text-xl text-white tracking-wide">{album.title}</h3>
                    <p className="text-white/40 text-xs mt-0.5">
                      {album.type === "single" ? "Single" : `${trackCount} Track${trackCount !== 1 ? "s" : ""}`}
                      {album.release_date ? ` · ${album.release_date.slice(0, 4)}` : ""}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <span className="font-display text-2xl text-gold">
                        ${parseFloat(album.price).toFixed(2)}
                      </span>
                      <button
                        className={`text-xs py-2 px-4 rounded transition-all duration-200 ${
                          inCart ? "text-green-400 border border-green-400/30" : "btn-gold"
                        }`}
                        onClick={() => addToCart(album)}
                      >
                        {inCart ? <span className="inline-flex items-center gap-1"><Check size={14} strokeWidth={2} /> In Cart</span> : "Buy Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment methods */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-white/20 text-xs tracking-widest uppercase">Secure Payments</p>
          <div className="flex flex-wrap justify-center gap-3">
            {PAYMENT_METHODS.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span>{icon}</span>
                <span className="text-white/40 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm text-white z-50"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(20px)" }}>
          {toast}
        </div>
      )}
    </section>
  );
}
