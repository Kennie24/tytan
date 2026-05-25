"use client";

/* eslint-disable @next/next/no-img-element */

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Disc3, Gift, Image as ImageIcon, Package, Shirt, ShoppingBag, Truck, Undo2 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { merchandiseApi, type Merchandise } from "@/lib/api";
import { fromTo, refreshScrollTrigger } from "@/lib/gsap-safe";

gsap.registerPlugin(ScrollTrigger);

const CAT_ACCENTS: Record<string, string> = {
  clothing:    "#FFFFFF",
  accessories: "#1DB954",
  vinyl:       "#FFFFFF",
  prints:      "#3B82F6",
  bundle:      "#EC4899",
};

const CAT_ICONS: Record<string, ReactNode> = {
  clothing:    <Shirt size={42} strokeWidth={1.35} />,
  accessories: <ShoppingBag size={42} strokeWidth={1.35} />,
  vinyl:       <Disc3 size={42} strokeWidth={1.35} />,
  prints:      <ImageIcon size={42} strokeWidth={1.35} />,
  bundle:      <Package size={42} strokeWidth={1.35} />,
};

type CartEntry = { id: number; name: string; size: string; price: number };

export default function MerchStore() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);

  const [items,    setItems]    = useState<Merchandise[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [cart,     setCart]     = useState<CartEntry[]>([]);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [toast,    setToast]    = useState("");

  useEffect(() => {
    merchandiseApi.list()
      .then((res) => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      fromTo(titleRef.current, { y: 80, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 80%", once: true },
      });
      fromTo(section.querySelectorAll(".merch-card"), { y: 60, opacity: 0, scale: 0.93 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });
      refreshScrollTrigger();
    }, section);
    return () => ctx.revert();
  }, [loading, items]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleAdd = (item: Merchandise) => {
    const sizes: string[] = item.sizes ?? [];
    if (sizes.length > 1 && !selected[item.id]) {
      showToast(`Please select a size for "${item.name}"`);
      return;
    }
    const size = selected[item.id] ?? (sizes[0] ?? "One Size");
    setCart((c) => [...c, { id: item.id, name: item.name, size, price: parseFloat(item.price) }]);
    showToast(`"${item.name}" added to cart!`);
  };

  const cartTotal = cart.reduce((acc, e) => acc + e.price, 0);

  return (
    <section
      ref={sectionRef}
      id="merch"
      className="snap-section relative flex flex-col items-center justify-center bg-transparent px-6 lg:px-16 py-16 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139,92,246,0.05) 0%, transparent 60%)",
      }} />

      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10">
          <div>
            <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-3">Official Store</p>
            <h2 ref={titleRef} className="text-section-title font-display text-white opacity-0">
              MERCH <span className="text-gold-gradient">STORE</span>
            </h2>
            <div className="section-divider mt-4 w-32" />
          </div>
          {cart.length > 0 && (
            <div className="mt-4 lg:mt-0 flex items-center gap-3">
              <span className="text-gold text-sm">
                <ShoppingBag size={15} strokeWidth={1.8} className="inline mr-2 align-[-2px]" /> {cart.length} item{cart.length > 1 ? "s" : ""} — ${cartTotal.toFixed(2)}
              </span>
              <button className="btn-gold text-xs py-2 px-5">Checkout</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="rounded-xl bg-white/5 aspect-[3/4]" />
            ))}
          </div>
        ) : !items.length ? (
          <p className="text-white/30 text-center py-12">Store coming soon. Check back shortly.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {items.map((item) => {
              const accent = CAT_ACCENTS[item.category] ?? "#FFFFFF";
              const icon  = CAT_ICONS[item.category]  ?? <Gift size={42} strokeWidth={1.35} />;
              const sizes: string[] = item.sizes ?? [];
              const inCart = cart.filter(c => c.id === item.id).length;
              const image = item.image_url ?? item.image;
              const stock = item.stock_quantity ?? item.stock ?? 0;
              const outOfStock = stock === 0;

              return (
                <div
                  key={item.id}
                  className="merch-card opacity-0 glass-card rounded-xl overflow-hidden group flex flex-col"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {/* Image */}
                  <div className="relative aspect-square flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${accent}15 0%, #000 100%)` }}>

                    {image ? (
                      <img src={image} alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-gold/80 group-hover:scale-110 transition-transform duration-500 relative z-10">
                        {icon}
                      </span>
                    )}

                    {/* Hover overlay */}
                    <div className="merch-overlay absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        className="text-white/85 hover:text-white text-[11px] font-bold capitalize bg-white/15 px-3 py-1.5 rounded-full transition-all hover:scale-105"
                        onClick={() => handleAdd(item)} 
                        disabled={outOfStock}
                        style={{ fontFamily: "var(--font-sans), sans-serif" }}
                      >
                        {outOfStock ? "Out of Stock" : "Quick Add"}
                      </button>
                    </div>

                    {/* Tag */}
                    {item.is_featured && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest"
                        style={{ background: `${accent}33`, color: accent, border: `1px solid ${accent}44` }}>
                        Featured
                      </div>
                    )}
                    {outOfStock && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest bg-red-900/40 text-red-400 border border-red-800/40">
                        Sold Out
                      </div>
                    )}
                    {inCart > 0 && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                        {inCart}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-white text-xs font-medium leading-tight mb-1">{item.name}</h3>
                    <p className="font-display text-base mb-2" style={{ color: accent }}>
                      ${parseFloat(item.price).toFixed(2)}
                    </p>

                    {/* Sizes */}
                    {sizes.length > 1 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {sizes.map((s) => (
                          <button key={s}
                            onClick={() => setSelected(prev => ({ ...prev, [item.id]: s }))}
                            className="text-[9px] px-1.5 py-0.5 rounded border transition-all duration-150"
                            style={{
                              borderColor: selected[item.id] === s ? accent : "rgba(255,255,255,0.1)",
                              color:       selected[item.id] === s ? accent : "rgba(255,255,255,0.4)",
                              background:  selected[item.id] === s ? `${accent}15` : "transparent",
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      className="mt-auto w-full py-2 text-xs rounded-full font-bold capitalize transition-all duration-200 hover:scale-102"
                      style={{ 
                        background: outOfStock ? "rgba(255,255,255,0.05)" : "#ffffff", 
                        color: outOfStock ? "rgba(255,255,255,0.2)" : "#000000", 
                        border: outOfStock ? "1px solid rgba(255,255,255,0.1)" : "none",
                        fontFamily: "var(--font-sans), sans-serif",
                        letterSpacing: "0.05em"
                      }}
                      onClick={() => handleAdd(item)}
                      disabled={outOfStock}
                    >
                      {outOfStock ? "Sold Out" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/25 text-xs">
          {[
            { icon: <Truck size={14} strokeWidth={1.8} />, text: "Worldwide Shipping" },
            { icon: <Package size={14} strokeWidth={1.8} />, text: "Secure Packaging" },
            { icon: <Shirt size={14} strokeWidth={1.8} />, text: "Official Merchandise" },
            { icon: <Undo2 size={14} strokeWidth={1.8} />, text: "30-Day Returns" },
          ].map(({ icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2">{icon}{text}</span>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm text-white z-50"
          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", backdropFilter: "blur(20px)" }}>
          {toast}
        </div>
      )}
    </section>
  );
}
