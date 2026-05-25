"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Crown,
  Disc3,
  DollarSign,
  Gem,
  Mic2,
  Music2,
  Plus,
  Search,
  Shirt,
  ShoppingCart,
  Upload,
  Users,
  Video,
} from "lucide-react";
import { adminApi, authStorage } from "@/lib/api";
import { fromTo } from "@/lib/gsap-safe";

// ── Types ──────────────────────────────────────────────────────────────

interface Stats {
  total_revenue: number;
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  total_fans: number;
  gold_members: number;
  vip_members: number;
  total_albums: number;
  total_songs: number;
  total_videos: number;
  total_events: number;
  total_merch: number;
}

type AdminTab = "dashboard" | "albums" | "songs" | "videos" | "events" | "merch" | "orders" | "fans";

const MOCK_STATS: Stats = {
  total_revenue: 48230.5,
  total_orders: 1842,
  paid_orders: 1690,
  pending_orders: 152,
  total_fans: 9345,
  gold_members: 312,
  vip_members: 78,
  total_albums: 3,
  total_songs: 36,
  total_videos: 12,
  total_events: 7,
  total_merch: 6,
};

const MOCK_ORDERS = [
  { id: 1, number: "TT-A3X9K2", customer: "Jane Mwangi", email: "jane@email.com", total: 12.99, status: "paid", method: "flutterwave", date: "2026-05-24" },
  { id: 2, number: "TT-B8M1Z7", customer: "Kofi Asante", email: "kofi@email.com", total: 64.99, status: "paid", method: "paypal", date: "2026-05-24" },
  { id: 3, number: "TT-C2P4Q1", customer: "Amara Diallo", email: "amara@email.com", total: 24.99, status: "pending", method: "card", date: "2026-05-25" },
  { id: 4, number: "TT-D6R3W5", customer: "Tunde Okafor", email: "tunde@email.com", total: 10.99, status: "paid", method: "mobile_money", date: "2026-05-25" },
  { id: 5, number: "TT-E9T7Y8", customer: "Naledi Dube", email: "naledi@email.com", total: 34.99, status: "refunded", method: "card", date: "2026-05-23" },
];

const MOCK_FANS = [
  { id: 1, name: "Jane Mwangi", email: "jane@email.com", tier: "gold", joined: "2026-03-12", orders: 4 },
  { id: 2, name: "Kofi Asante", email: "kofi@email.com", tier: "vip", joined: "2026-02-05", orders: 7 },
  { id: 3, name: "Amara Diallo", email: "amara@email.com", tier: "free", joined: "2026-04-20", orders: 1 },
  { id: 4, name: "Tunde Okafor", email: "tunde@email.com", tier: "gold", joined: "2026-01-15", orders: 5 },
];

// ── Status badge ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "#22c55e", pending: "#f59e0b", failed: "#ef4444",
    refunded: "#6b7280", free: "#6b7280", gold: "#FFFFFF", vip: "#1DB954",
  };
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-medium"
      style={{ background: `${colors[status] ?? "#666"}22`, color: colors[status] ?? "#666", border: `1px solid ${colors[status] ?? "#666"}44` }}
    >
      {status}
    </span>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent = "#FFFFFF", sub }: {
  label: string; value: string | number; icon: ReactNode; accent?: string; sub?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-2 stat-card"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]" style={{ color: accent }}>{icon}</span>
        <span className="text-[10px] text-white/30 tracking-widest uppercase">{label}</span>
      </div>
      <p className="font-display text-3xl" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-white/30 text-xs">{sub}</p>}
    </div>
  );
}

// ── Upload form ────────────────────────────────────────────────────────

function UploadForm({ type }: { type: string }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fields: Record<string, { label: string; fields: { name: string; placeholder: string; type?: string }[] }> = {
    albums: {
      label: "New Album",
      fields: [
        { name: "title", placeholder: "Album title" },
        { name: "price", placeholder: "Price (USD)", type: "number" },
        { name: "release_year", placeholder: "Release year (e.g. 2024)" },
        { name: "description", placeholder: "Description" },
        { name: "genre", placeholder: "Genre" },
        { name: "type", placeholder: "Type (album/ep/single)" },
      ],
    },
    songs: {
      label: "New Song",
      fields: [
        { name: "title", placeholder: "Song title" },
        { name: "price", placeholder: "Single price", type: "number" },
        { name: "duration_seconds", placeholder: "Duration (seconds)", type: "number" },
        { name: "track_number", placeholder: "Track number", type: "number" },
      ],
    },
    videos: {
      label: "New Video",
      fields: [
        { name: "title", placeholder: "Video title" },
        { name: "youtube_url", placeholder: "YouTube URL" },
        { name: "type", placeholder: "Type (official/lyric/live/bts/visualizer)" },
      ],
    },
    events: {
      label: "New Event",
      fields: [
        { name: "title", placeholder: "Event title" },
        { name: "city", placeholder: "City" },
        { name: "venue", placeholder: "Venue" },
        { name: "event_date", placeholder: "Date & time", type: "datetime-local" },
        { name: "ticket_price", placeholder: "Ticket price", type: "number" },
        { name: "currency", placeholder: "Currency (e.g. USD)" },
      ],
    },
    merch: {
      label: "New Merchandise",
      fields: [
        { name: "name", placeholder: "Product name" },
        { name: "price", placeholder: "Price", type: "number" },
        { name: "category", placeholder: "Category (clothing/accessories/vinyl/prints/bundle)" },
        { name: "stock", placeholder: "Stock quantity", type: "number" },
      ],
    },
  };

  const config = fields[type];
  if (!config) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const token = authStorage.getToken();
    if (!token) {
      setError("No admin token found. Log in from the Laravel admin login page first.");
      setSaving(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    if (!formData.has("is_published")) formData.set("is_published", "0");

    try {
      let response: unknown;
      if (type === "albums") response = await adminApi.createAlbum(token, formData);
      else if (type === "songs") response = await adminApi.createSong(token, formData);
      else throw new Error("This form is not wired for uploads yet.");

      if (response && typeof response === "object" && "message" in response) {
        throw new Error(String((response as { message: unknown }).message));
      }

      e.currentTarget.reset();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <h3 className="font-display text-xl text-white mb-5 tracking-wide">
        Upload / Add {config.label}
      </h3>
      {saved ? (
        <div className="flex items-center gap-3 text-green-400 py-4">
          <CheckCircle2 size={22} strokeWidth={1.8} />
          <span className="text-sm">Saved successfully and uploaded to the API.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {config.fields.map((f) => (
            <div key={f.name}>
              <label className="text-white/30 text-xs tracking-widest uppercase block mb-1">{f.name.replace(/_/g," ")}</label>
              <input
                name={f.name}
                type={f.type || "text"}
                className="form-input"
                placeholder={f.placeholder}
                required={["title", "price", "duration_seconds", "track_number"].includes(f.name)}
              />
            </div>
          ))}
          {type === "albums" && (
            <div>
              <label className="text-white/30 text-xs tracking-widest uppercase block mb-1">Album cover art</label>
              <input name="cover_art" type="file" accept="image/*" className="form-input" />
            </div>
          )}

          {type === "songs" && (
            <>
              <div>
                <label className="text-white/30 text-xs tracking-widest uppercase block mb-1">Full song audio</label>
                <input name="audio_upload" type="file" accept="audio/*" className="form-input" required />
              </div>
              <div>
                <label className="text-white/30 text-xs tracking-widest uppercase block mb-1">Preview audio (optional)</label>
                <input name="preview_upload" type="file" accept="audio/*" className="form-input" />
              </div>
              <div>
                <label className="text-white/30 text-xs tracking-widest uppercase block mb-1">Album ID (optional)</label>
                <input name="album_id" type="number" className="form-input" placeholder="Attach to album ID" />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2">
            <label className="text-white/30 text-xs flex items-center gap-2 cursor-pointer">
              <input name="is_published" value="1" type="checkbox" className="accent-gold" />
              <span className="tracking-widest uppercase">Publish immediately</span>
            </label>
          </div>
          <button type="submit" className="btn-gold py-3 mt-2 flex items-center justify-center gap-2" disabled={saving}>
            <Upload size={16} strokeWidth={1.8} /> {saving ? "Uploading..." : `Save ${config.label}`}
          </button>
        </form>
      )}
    </div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [orderFilter, setOrderFilter] = useState("all");
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      authStorage.setToken(token);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    }
    fromTo(document.querySelectorAll(".stat-card"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, ease: "power3.out", delay: 0.3 });
  }, [tab]);

  const TABS: { id: AdminTab; label: string; icon: ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={17} strokeWidth={1.7} /> },
    { id: "albums",    label: "Albums",    icon: <Disc3 size={17} strokeWidth={1.7} /> },
    { id: "songs",     label: "Songs",     icon: <Music2 size={17} strokeWidth={1.7} /> },
    { id: "videos",    label: "Videos",    icon: <Video size={17} strokeWidth={1.7} /> },
    { id: "events",    label: "Events",    icon: <Mic2 size={17} strokeWidth={1.7} /> },
    { id: "merch",     label: "Merch",     icon: <Shirt size={17} strokeWidth={1.7} /> },
    { id: "orders",    label: "Orders",    icon: <ShoppingCart size={17} strokeWidth={1.7} /> },
    { id: "fans",      label: "Fans",      icon: <Users size={17} strokeWidth={1.7} /> },
  ];

  const filteredOrders = orderFilter === "all"
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(o => o.status === orderFilter);

  return (
    <div className="min-h-screen bg-black text-white flex" style={{ fontFamily: "var(--font-inter)" }}>

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col"
        style={{ background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Logo */}
        <div className="p-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h1 className="font-display text-2xl text-gold-gradient tracking-widest">TYTAN</h1>
          <p className="text-white/30 text-xs tracking-widest mt-0.5">ADMIN PANEL</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-sm"
              style={{
                background: tab === t.id ? "rgba(255,255,255,0.08)" : "transparent",
                color: tab === t.id ? "var(--gold)" : "rgba(255,255,255,0.5)",
                border: tab === t.id ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
              }}
            >
              <span>{t.icon}</span>
              <span className="tracking-wide">{t.label}</span>
              {tab === t.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm">T</div>
            <div>
              <p className="text-white text-xs font-medium">Tytan Takuba</p>
              <p className="text-white/30 text-[10px]">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div ref={headerRef} className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <h2 className="font-display text-2xl text-white tracking-wide">
              <span className="inline-flex items-center gap-2">
                {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label.toUpperCase()}
              </span>
            </h2>
            <p className="text-white/30 text-xs mt-0.5">Tytan Takuba Admin · {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="btn-outline-white text-xs py-2 px-4 inline-flex items-center gap-2"><ArrowLeft size={14} strokeWidth={1.8} /> View Site</Link>
            <button className="btn-gold text-xs py-2 px-4 inline-flex items-center gap-2"><Plus size={14} strokeWidth={1.8} /> New Upload</button>
          </div>
        </div>

        <div className="p-8">

          {/* ── Dashboard ── */}
          {tab === "dashboard" && (
            <div className="flex flex-col gap-8">
              {/* Revenue + orders grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Revenue" value={`$${MOCK_STATS.total_revenue.toLocaleString()}`} icon={<DollarSign size={18} strokeWidth={1.7} />} accent="#FFFFFF" sub="All time" />
                <StatCard label="Paid Orders" value={MOCK_STATS.paid_orders} icon={<CheckCircle2 size={18} strokeWidth={1.7} />} accent="#22c55e" sub={`${MOCK_STATS.pending_orders} pending`} />
                <StatCard label="Total Fans" value={MOCK_STATS.total_fans.toLocaleString()} icon={<Users size={18} strokeWidth={1.7} />} accent="#3B82F6" sub={`${MOCK_STATS.gold_members} Gold · ${MOCK_STATS.vip_members} VIP`} />
                <StatCard label="Albums" value={MOCK_STATS.total_albums} icon={<Disc3 size={18} strokeWidth={1.7} />} accent="#1DB954" sub={`${MOCK_STATS.total_songs} songs`} />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Videos" value={MOCK_STATS.total_videos} icon={<Video size={18} strokeWidth={1.7} />} accent="#3B82F6" />
                <StatCard label="Live Events" value={MOCK_STATS.total_events} icon={<Mic2 size={18} strokeWidth={1.7} />} accent="#FFFFFF" />
                <StatCard label="Merch Items" value={MOCK_STATS.total_merch} icon={<Shirt size={18} strokeWidth={1.7} />} accent="#1DB954" />
                <StatCard label="Gold Members" value={MOCK_STATS.gold_members} icon={<Crown size={18} strokeWidth={1.7} />} accent="#FFFFFF" sub={`${MOCK_STATS.vip_members} VIP Elite`} />
              </div>

              {/* Recent orders table */}
              <div className="glass-card rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <h3 className="font-display text-lg text-white tracking-wide">RECENT ORDERS</h3>
                  <button onClick={() => setTab("orders")} className="text-gold text-xs hover:underline">View all →</button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/30 text-xs tracking-widest uppercase">
                      <th className="px-6 py-3 text-left">Order</th>
                      <th className="px-6 py-3 text-left">Customer</th>
                      <th className="px-6 py-3 text-left">Total</th>
                      <th className="px-6 py-3 text-left">Method</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.slice(0, 5).map(o => (
                      <tr key={o.id} className="border-t border-white/05 hover:bg-white/02 transition-colors">
                        <td className="px-6 py-3 text-gold font-mono text-xs">{o.number}</td>
                        <td className="px-6 py-3">
                          <p className="text-white/80">{o.customer}</p>
                          <p className="text-white/30 text-xs">{o.email}</p>
                        </td>
                        <td className="px-6 py-3 text-white font-medium">${o.total}</td>
                        <td className="px-6 py-3 text-white/40 text-xs capitalize">{o.method.replace("_"," ")}</td>
                        <td className="px-6 py-3"><StatusBadge status={o.status} /></td>
                        <td className="px-6 py-3 text-white/30 text-xs">{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Upload tabs ── */}
          {["albums","songs","videos","events","merch"].includes(tab) && (
            <div className="grid lg:grid-cols-2 gap-8">
              <UploadForm type={tab} />
              {/* Existing list */}
              <div className="glass-card rounded-xl p-6" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 className="font-display text-xl text-white mb-4 tracking-wide">
                  Existing {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </h3>
                <p className="text-white/30 text-sm">
                  Connect to <code className="text-gold bg-gold/10 px-1 rounded">/api/admin/{tab}</code> to list, edit, and delete items.
                </p>
                <div className="mt-4 p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p className="text-gold text-xs tracking-widest uppercase mb-2">API Endpoints</p>
                  <div className="flex flex-col gap-1.5 text-xs font-mono text-white/40">
                    <span><span className="text-green-400">GET</span>    /api/{tab}</span>
                    <span><span className="text-blue-400">POST</span>   /api/admin/{tab}</span>
                    <span><span className="text-yellow-400">PATCH</span>  /api/admin/{tab}/&#123;id&#125;</span>
                    <span><span className="text-red-400">DELETE</span> /api/admin/{tab}/&#123;id&#125;</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {tab === "orders" && (
            <div className="flex flex-col gap-6">
              {/* Filter */}
              <div className="flex gap-2">
                {["all","paid","pending","refunded","failed"].map(f => (
                  <button key={f} onClick={() => setOrderFilter(f)}
                    className={`px-4 py-1.5 text-xs tracking-widest uppercase rounded-full border transition-all`}
                    style={{
                      background: orderFilter === f ? "var(--gold)" : "transparent",
                      color: orderFilter === f ? "#000" : "rgba(255,255,255,0.4)",
                      borderColor: orderFilter === f ? "var(--gold)" : "rgba(255,255,255,0.1)",
                      fontFamily: "var(--font-bebas)",
                    }}>
                    {f}
                  </button>
                ))}
              </div>

              <div className="glass-card rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/30 text-xs tracking-widest uppercase" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th className="px-6 py-4 text-left">Order #</th>
                      <th className="px-6 py-4 text-left">Customer</th>
                      <th className="px-6 py-4 text-left">Total</th>
                      <th className="px-6 py-4 text-left">Payment</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id} className="border-t border-white/05 hover:bg-white/02 transition-colors">
                        <td className="px-6 py-4 text-gold font-mono text-xs">{o.number}</td>
                        <td className="px-6 py-4">
                          <p className="text-white/80">{o.customer}</p>
                          <p className="text-white/30 text-xs">{o.email}</p>
                        </td>
                        <td className="px-6 py-4 text-white font-medium">${o.total}</td>
                        <td className="px-6 py-4 text-white/40 text-xs capitalize">{o.method.replace("_"," ")}</td>
                        <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                        <td className="px-6 py-4 text-white/30 text-xs">{o.date}</td>
                        <td className="px-6 py-4">
                          <button className="text-xs text-gold hover:underline">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Fans ── */}
          {tab === "fans" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total Fans" value={MOCK_STATS.total_fans.toLocaleString()} icon={<Users size={18} strokeWidth={1.7} />} accent="#1DB954" />
                <StatCard label="Gold Members" value={MOCK_STATS.gold_members} icon={<Crown size={18} strokeWidth={1.7} />} accent="#1DB954" />
                 <StatCard label="VIP Members" value={MOCK_STATS.vip_members} icon={<Gem size={18} strokeWidth={1.7} />} accent="#1DB954" />
              </div>

              <div className="glass-card rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="relative max-w-sm">
                    <Search size={16} strokeWidth={1.7} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" className="form-input pl-9" placeholder="Search fans by name or email…" />
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/30 text-xs tracking-widest uppercase" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th className="px-6 py-4 text-left">Fan</th>
                      <th className="px-6 py-4 text-left">Membership</th>
                      <th className="px-6 py-4 text-left">Orders</th>
                      <th className="px-6 py-4 text-left">Joined</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_FANS.map(f => (
                      <tr key={f.id} className="border-t border-white/05 hover:bg-white/02 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                              style={{ background: "rgba(29,185,84,0.2)" }}>
                              {f.name[0]}
                            </div>
                            <div>
                              <p className="text-white/80">{f.name}</p>
                              <p className="text-white/30 text-xs">{f.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={f.tier} /></td>
                        <td className="px-6 py-4 text-white/60">{f.orders}</td>
                        <td className="px-6 py-4 text-white/30 text-xs">{f.joined}</td>
                        <td className="px-6 py-4">
                          <button className="text-xs text-gold hover:underline">View Profile</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
