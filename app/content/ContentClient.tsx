"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Instagram,
  ExternalLink,
  Grid3x3,
  Play,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  Images,
} from "lucide-react";
import { useTheme } from "@/app/providers";
import { useLanguage } from "@/app/providers/LanguageContext";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface BeholdPost {
  id: string;
  timestamp: string;
  permalink: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  isReel?: boolean;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  prunedCaption?: string;
  sizes: {
    small: { mediaUrl: string; width: number; height: number };
    medium: { mediaUrl: string; width: number; height: number };
    large: { mediaUrl: string; width: number; height: number };
  };
}

interface BeholdData {
  username: string;
  biography: string;
  profilePictureUrl: string;
  website?: string;
  followersCount: number;
  followsCount: number;
  posts: BeholdPost[];
}

/* ─────────────────────────────────────────────
   STATIC
───────────────────────────────────────────── */
const STATIC = {
  fullName: "Galang Rizky Arridho",
  profilePic: "/assets/profile.png",
  igUrl: "https://www.instagram.com/kyydeveloper_id/",
  verified: true,
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(timestamp: string, lang: "id" | "en"): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (lang === "id") {
    if (months > 0) return `${months} bulan lalu`;
    if (weeks > 0) return `${weeks} minggu lalu`;
    if (days > 0) return `${days} hari lalu`;
    return "Baru saja";
  }
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  return "Just now";
}

function getThumb(post: BeholdPost): string {
  return post.sizes?.medium?.mediaUrl ?? post.thumbnailUrl ?? post.mediaUrl;
}

/* ─────────────────────────────────────────────
   EMBED MODAL
───────────────────────────────────────────── */
function EmbedModal({
  post,
  onClose,
  lang,
}: {
  post: BeholdPost;
  onClose: () => void;
  lang: "id" | "en";
}) {
  useEffect(() => {
    const existing = document.getElementById("ig-embed-script");
    if (!existing) {
      const s = document.createElement("script");
      s.id = "ig-embed-script";
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    } else {
      // @ts-ignore
      if (window.instgrm) window.instgrm.Embeds.process();
    }
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ type: "spring", damping: 24, stiffness: 240 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-[#0f172a]"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#1e293b] text-gray-500 dark:text-slate-400"
        >
          <X size={14} />
        </button>

        <div className="p-4 pb-2">
          <blockquote
            className="instagram-media"
            data-instgrm-captioned
            data-instgrm-permalink={post.permalink}
            data-instgrm-version="14"
            style={{
              border: 0,
              borderRadius: "12px",
              boxShadow: "none",
              margin: "0",
              minWidth: "100%",
              padding: 0,
              width: "99.375%",
            }}
          />
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-[#1e293b]">
          <span className="text-xs text-gray-500 dark:text-slate-400" suppressHydrationWarning>
            {timeAgo(post.timestamp, lang)}
          </span>
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 bg-gray-100 dark:bg-[#1e293b] text-gray-700 dark:text-slate-200"
          >
            <Instagram size={12} />
            {lang === "id" ? "Buka di IG" : "Open in IG"}
            <ExternalLink size={11} />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   POST CARD
───────────────────────────────────────────── */
function PostCard({
  post,
  index,
  onClick,
}: {
  post: BeholdPost;
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const thumb = getThumb(post);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
      className="relative aspect-square overflow-hidden cursor-pointer rounded-sm bg-gray-100 dark:bg-[#1e293b]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Image
        src={thumb}
        alt={post.prunedCaption?.slice(0, 60) ?? "Instagram post"}
        fill
        className="object-cover transition-transform duration-500"
        style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
        sizes="(max-width: 768px) 33vw, 200px"
        unoptimized
      />

      {(post.mediaType === "VIDEO" || post.mediaType === "CAROUSEL_ALBUM") && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
            {post.mediaType === "VIDEO" ? (
              <Play size={10} className="text-white fill-white" />
            ) : (
              <Images size={10} className="text-white" />
            )}
          </div>
        </div>
      )}

      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-end bg-linear-to-t from-black/70 via-black/20 to-transparent p-3"
      >
        {post.prunedCaption && (
          <p className="text-white text-xs line-clamp-2 leading-relaxed">
            {post.prunedCaption}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   STAT
───────────────────────────────────────────── */
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-bold text-base md:text-lg text-gray-900 dark:text-slate-100">
        {typeof value === "number" ? formatCount(value) : value}
      </span>
      <span className="text-xs text-gray-400 dark:text-[#64748b]">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function ContentClient() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === "dark";

  const [data, setData] = useState<BeholdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<BeholdPost | null>(null);
  const [tab, setTab] = useState<"all" | "reels">("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/instagram");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message ?? "Gagal memuat data Instagram");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const t = {
    title: lang === "id" ? "Konten" : "Content",
    subtitle:
      lang === "id"
        ? "Ikuti perjalanan saya di Instagram untuk konten seputar web development, bisnis digital, dan tips developer."
        : "Follow my Instagram journey for web development content, digital business, and developer tips.",
    followBtn: lang === "id" ? "Ikuti di Instagram" : "Follow on Instagram",
    posts: lang === "id" ? "Postingan" : "Posts",
    followers: lang === "id" ? "Pengikut" : "Followers",
    following: lang === "id" ? "Mengikuti" : "Following",
    all: lang === "id" ? "Semua" : "All",
    reels: "Reels",
    loading: lang === "id" ? "Memuat dari Instagram..." : "Loading from Instagram...",
    retry: lang === "id" ? "Coba lagi" : "Retry",
    hint:
      lang === "id"
        ? "Klik foto untuk melihat post lengkap"
        : "Click a photo to view the full post",
  };

  const filteredPosts = data?.posts.filter((p) =>
    tab === "reels" ? p.isReel || p.mediaType === "VIDEO" : true
  ) ?? [];

  return (
    <div className="min-h-screen transition-colors duration-200 bg-[#fafafa] dark:bg-[#0f172a]">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Instagram size={18} className="text-[#e1306c]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#e1306c]">
              Instagram
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-slate-100">
            {t.title}
          </h1>
          <p className="text-sm leading-relaxed max-w-lg text-gray-500 dark:text-slate-400">
            {t.subtitle}
          </p>
        </motion.div>

        {/* ── Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 md:p-6 mb-6 shadow-sm bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b]"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden p-0.5"
                style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#0f172a]">
                  <Image
                    src={data?.profilePictureUrl ?? STATIC.profilePic}
                    alt={STATIC.fullName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="font-bold text-base md:text-lg text-gray-900 dark:text-slate-100">
                  @{data?.username ?? "kyydeveloper_id"}
                </span>
                {STATIC.verified && (
                  <Image src="/assets/centang.png" alt="verified" width={15} height={15} className="shrink-0" />
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-6 mb-3">
                <Stat label={t.posts} value={data?.posts.length ?? 0} />
                <Stat label={t.followers} value={data?.followersCount ?? 0} />
                <Stat label={t.following} value={data?.followsCount ?? 0} />
              </div>

              <p className="text-sm font-semibold mb-1 text-gray-900 dark:text-slate-100">
                {STATIC.fullName}
              </p>
              {data?.biography && (
                <p className="text-xs leading-relaxed whitespace-pre-line mb-4 text-gray-500 dark:text-slate-400">
                  {data.biography}
                </p>
              )}

              <a
                href={STATIC.igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(90deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
              >
                <Instagram size={14} />
                {t.followBtn}
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div className="flex items-center border-b border-gray-200 dark:border-[#1e293b] mb-1">
          {([ ["all", t.all, Grid3x3], ["reels", t.reels, Play] ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold uppercase tracking-wider relative transition-colors duration-150 ${
                tab === key
                  ? "text-gray-900 dark:text-slate-100"
                  : "text-gray-400 dark:text-[#64748b]"
              }`}
            >
              <Icon size={13} />
              {label}
              {tab === key && (
                <motion.div
                  layoutId="tab-line"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-slate-100"
                />
              )}
            </button>
          ))}
        </div>

        <p className="text-xs py-3 text-center text-gray-400 dark:text-[#64748b]">
          {t.hint}
        </p>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={24} className="animate-spin text-gray-400 dark:text-slate-500" />
            <span className="text-sm text-gray-400 dark:text-slate-500">{t.loading}</span>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-red-50 dark:bg-[#1e293b] text-red-600 dark:text-red-400">
              <AlertCircle size={16} />
              {error}
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1e293b] text-gray-700 dark:text-slate-200"
            >
              <RefreshCw size={14} />
              {t.retry}
            </button>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="grid grid-cols-3 gap-0.5">
            {filteredPosts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                index={i}
                onClick={() => setActivePost(post)}
              />
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        {!loading && !error && (
          <p className="text-xs text-center mt-8 text-gray-400 dark:text-[#64748b]">
            {lang === "id"
              ? "Data real-time via Behold.so · Klik gambar untuk embed resmi Instagram"
              : "Real-time data via Behold.so · Click image for official Instagram embed"}
          </p>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {activePost && (
          <EmbedModal
            post={activePost}
            onClose={() => setActivePost(null)}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}