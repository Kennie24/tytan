"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { Play, Video as VideoIcon } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { videosApi, type Video } from "@/lib/api";
import { fromTo, refreshScrollTrigger } from "@/lib/gsap-safe";

gsap.registerPlugin(ScrollTrigger);

const TYPE_ACCENTS: Record<string, string> = {
  official:   "#1DB954",
  lyric:      "#3B82F6",
  live:       "#EF4444",
  bts:        "#FFFFFF",
  visualizer: "#1DB954",
};

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function formatDuration(s: number | null): string {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideosGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);

  const [videos,  setVideos]  = useState<Video[]>([]);
  const [featured, setFeatured] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    videosApi.list()
      .then((res) => setVideos(res.data))
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
      fromTo(section.querySelectorAll(".video-item"),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 70%", once: true } }
      );
      refreshScrollTrigger();
    }, section);
    return () => ctx.revert();
  }, [loading, videos]);

  const featVid = videos[featured];
  const accent  = featVid ? (TYPE_ACCENTS[featVid.type] ?? "#1DB954") : "#1DB954";
  const featuredThumbnail = featVid?.thumbnail_url ?? featVid?.thumbnail;
  const featuredViews = featVid?.views ?? featVid?.view_count ?? 0;

  return (
    <section
      ref={sectionRef}
      id="videos"
      className="snap-section relative flex flex-col items-center justify-center bg-transparent px-6 lg:px-16 py-16 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 40% at 0% 50%, rgba(59,130,246,0.06) 0%, transparent 60%)",
      }} />

      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-3">Watch</p>
          <h2 ref={titleRef} className="text-section-title font-display text-white opacity-0">
            MUSIC <span className="text-purple-gradient">VIDEOS</span>
          </h2>
          <div className="section-divider mt-4 w-32" />
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-6 animate-pulse">
            <div className="lg:col-span-2 aspect-video rounded-xl bg-white/5" />
            <div className="flex flex-col gap-3">
              {[0,1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-white/5" />)}
            </div>
          </div>
        ) : !videos.length ? (
          <p className="text-white/30 text-center py-12">No videos available yet.</p>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Featured player */}
              <div className="lg:col-span-2">
                <div
                  className="relative rounded-xl overflow-hidden aspect-video group cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${accent}22 0%, #000 100%)`,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Thumbnail or YouTube embed placeholder */}
                  {featuredThumbnail ? (
                    <img
                      src={featuredThumbnail}
                      alt={featVid.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[8rem] opacity-15">
                      <VideoIcon size={88} strokeWidth={1.15} className="text-white/50" />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors duration-300">
                    <a
                      href={featVid?.youtube_url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{ background: `${accent}dd`, boxShadow: `0 0 40px ${accent}66` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Play size={28} strokeWidth={2} fill="currentColor" className="text-white ml-1" />
                    </a>
                  </div>

                  {/* Featured badge */}
                  {featVid?.is_featured && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest"
                        style={{ background: "rgba(255,255,255,0.15)", color: "var(--gold)", border: "1px solid rgba(255,255,255,0.3)" }}>
                        Featured
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display text-2xl text-white drop-shadow">{featVid?.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-white/40 text-xs capitalize">{featVid?.type}</span>
                      {featuredViews > 0 && (
                        <>
                          <span className="text-white/20 text-xs">·</span>
                          <span className="text-white/40 text-xs">{formatViews(featuredViews)} views</span>
                        </>
                      )}
                      {featVid?.duration && (
                        <>
                          <span className="text-white/20 text-xs">·</span>
                          <span className="text-white/40 text-xs">{formatDuration(featVid.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Side list */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] lg:max-h-none lg:overflow-hidden">
                {videos.map((v, i) => {
                  const ac = TYPE_ACCENTS[v.type] ?? "#1DB954";
                  const thumbnail = v.thumbnail_url ?? v.thumbnail;
                  const views = v.views ?? v.view_count ?? 0;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setFeatured(i)}
                      className={`video-item opacity-0 flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300`}
                      style={{
                        background: featured === i ? "rgba(255,255,255,0.04)" : undefined,
                        border: `1px solid ${featured === i ? "rgba(255,255,255,0.1)" : "transparent"}`,
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        className="w-20 h-12 rounded-lg flex-shrink-0 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${ac}22 0%, #0a0a0a 100%)`,
                          border: `1px solid ${featured === i ? ac + "44" : "rgba(255,255,255,0.05)"}`,
                        }}
                      >
                        {thumbnail ? (
                          <img src={thumbnail} alt={v.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><VideoIcon size={20} strokeWidth={1.6} className="text-white/60" /></div>
                        )}
                        {featured === i && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play size={13} strokeWidth={2} fill="currentColor" className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate transition-colors ${featured === i ? "text-white" : "text-white/60"}`}>
                          {v.title}
                        </p>
                        <p className="text-white/25 text-[10px] mt-0.5 capitalize">
                          {v.type}
                          {views > 0 ? ` · ${formatViews(views)} views` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-white/30 text-sm">
                More videos on YouTube ·{" "}
                <span className="text-gold">@TytanTakuba</span>
              </p>
              <a
                href="https://youtube.com/@TytanTakuba"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-gold text-xs py-2 px-5"
              >
                Subscribe →
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
