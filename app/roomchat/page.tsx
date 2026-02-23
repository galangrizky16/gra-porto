"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Send, LogOut, Github, Smile, Users, Inbox, CornerUpLeft, X, Trash2 } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageContext";

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  id: {
    title: "Ruang Obrolan",
    subtitle: "Jangan ragu untuk berbagi pemikiran, saran, pertanyaan, atau apa pun!",
    signOut: "Keluar",
    noMessages: "Belum ada pesan",
    placeholder: "Tulis pesan... (ketik @ untuk mention)",
    loginPrompt: "Silakan masuk untuk bergabung dalam percakapan.",
    loginSub: "Jangan khawatir, data Anda aman bersama kami.",
    loginGoogle: "Masuk dengan Google",
    loginGithub: "Masuk dengan GitHub",
    online: "online",
    footer: "Ruang obrolan bersifat publik · Konten tidak pantas akan dihapus",
    author: "Author",
    you: "Kamu",
    user: "Pengguna",
    deleted: "Pesan ini telah dihapus",
    deletedPeek: "Pesan dihapus",
    deleteTitle: "Hapus pesan?",
    deleteForAll: "Hapus untuk Semua Orang",
    deleteForAllSub: "Pesan akan dihapus dari semua orang",
    deleteForMe: "Hapus untuk Saya",
    deleteForMeSub: "Pesan hanya hilang di perangkat kamu",
    cancel: "Batal",
    replyingTo: "Membalas",
    copyright: "© 2025 Galang Rizky Arridho",
    toxicWarning: "Pesan mengandung kata yang tidak pantas dan tidak dapat dikirim.",
    toxicWarningSub: "Harap jaga kesopanan dalam berkomunikasi. 🙏",
    toxicInputHint: "Kata tidak pantas terdeteksi",
  },
  en: {
    title: "Chat Room",
    subtitle: "Feel free to share your thoughts, suggestions, questions, or anything!",
    signOut: "Sign Out",
    noMessages: "No messages yet",
    placeholder: "Write a message... (type @ to mention)",
    loginPrompt: "Please sign in to join the conversation.",
    loginSub: "Don't worry, your data is safe with us.",
    loginGoogle: "Sign in with Google",
    loginGithub: "Sign in with GitHub",
    online: "online",
    footer: "Chat room is public · Inappropriate content will be removed",
    author: "Author",
    you: "You",
    user: "User",
    deleted: "This message was deleted",
    deletedPeek: "Message deleted",
    deleteTitle: "Delete message?",
    deleteForAll: "Delete for Everyone",
    deleteForAllSub: "This message will be removed for everyone",
    deleteForMe: "Delete for Me",
    deleteForMeSub: "Message will only disappear on your device",
    cancel: "Cancel",
    replyingTo: "Replying to",
    copyright: "© 2025 Galang Rizky Arridho",
    toxicWarning: "Your message contains inappropriate language and cannot be sent.",
    toxicWarningSub: "Please keep the conversation respectful. 🙏",
    toxicInputHint: "Inappropriate word detected",
  },
} as const;

type Lang = keyof typeof T;

// ── Toxic Word Filter ─────────────────────────────────────────────────────────
// Daftar kata kasar bahasa Indonesia (gaul, slang, variasi penulisan)
const TOXIC_PATTERNS: RegExp[] = (() => {
  // Helper: buat regex yang toleran terhadap variasi penulisan
  // Contoh: "a" bisa ditulis "4", "@", "a"; "i" bisa "1", "!"; dst.
  const flex = (word: string): RegExp => {
    const map: Record<string, string> = {
      a: "[a4@]", i: "[i1!]", e: "[e3]", o: "[o0]",
      u: "[u]", s: "[s5$]", t: "[t7]", g: "[g9]",
    };
    const pattern = word
      .split("")
      .map((c) => {
        const lower = c.toLowerCase();
        if (map[lower]) return map[lower];
        // Escape special regex characters
        return c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      })
      .join("[\\s\\-_.*]*"); // toleran spasi/tanda di antara huruf
    return new RegExp(pattern, "i");
  };

  // ── Kata kasar inti ──────────────────────────────────────────────────────
  const words = [
    // Makian umum
    "anjing", "anjir", "anjrit", "anjay", "anying",
    "babi", "celeng",
    "bangsat", "bgst",
    "bajingan", "bajind",
    "bedebah", "brengsek",
    "keparat", "kepruk",
    "sialan", "setan", "iblis",
    "tai", "tahi", "taek",
    "kurang ajar", "kurang ajar",
    "goblok", "goblog",
    "bodoh", "bodo",
    "tolol", "tolo",
    "idiot", "idot",
    "dungu", "budeg",
    "bebal",
    "kampret", "kamprit",
    "brengsek",
    "asu",             // anjing dalam Jawa
    "jancok", "jancuk", "dancuk", "dancok", "diancuk",
    "matamu", "matane",
    "ngentot", "entot", "kentot",
    "ngewe", "ngwe",
    // Alat kelamin & seksual
    "kontol", "kontek", "kntl",
    "memek", "mmk",
    "pepek", "ppk",
    "titit", "titi",
    "ngaceng",
    "coli", "ngocol",
    "colmek",
    "pelacur", "lacur",
    "sundal", "sundel",
    "lonte", "lonthe",
    "jablay",
    "peler",
    "nenen",
    "bokong",
    "pantat", "pntt",
    "toket", "tokat",
    "sempak",
    "ranjang",
    "bejat",
    // Diskriminasi & SARA (tetap filter)
    "kafir",
    "monyet",           // sering dipakai sebagai makian
    "kera",
    "bego", "begu",
    "culun",
    // Singkatan/slang kasar
    "wkwk anjing", "wtf", "fck", "fuk", "fvck",
    "stfu", "kys",      // kill yourself
    "die", // dalam konteks kasar
    // Gaul modern
    "gais babi",
    "kampang",          // kampung + bajingan
    "banci", "waria",   // dipakai sebagai makian
    "autis",            // sering disalahgunakan sebagai makian
  ];

  return words.map(flex);
})();

// Sensor kata: ganti kata kasar dengan bintang
function censorText(text: string): string {
  let result = text;
  for (const pattern of TOXIC_PATTERNS) {
    result = result.replace(pattern, (match) => {
      if (match.length <= 2) return "**";
      return match[0] + "*".repeat(match.length - 2) + match[match.length - 1];
    });
  }
  return result;
}

// Deteksi apakah teks mengandung kata kasar
function hasToxic(text: string): boolean {
  return TOXIC_PATTERNS.some((p) => p.test(text));
}

// Reset lastIndex untuk pattern dengan flag g (biar tidak geser)
function resetPatterns() {
  TOXIC_PATTERNS.forEach((p) => { if (p.global) p.lastIndex = 0; });
}


const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Ganti dengan User ID kamu dari Supabase → Authentication → Users ─────────
const OWNER_ID = "966baba9-5e9b-4fb6-84a8-e00520f60c22";

type Profile = { id: string; full_name: string | null; avatar_url: string | null };
type Message = {
  id: string;
  content: string | null;
  created_at: string;
  user_id: string;
  reply_to_id: string | null;
  profiles: Profile | null;
};

const EMOJIS = ["😊","😂","❤️","👍","🔥","✨","🎉","😎","🤔","💡","👋","🙏"];

// ── Emoji Picker ──────────────────────────────────────────────────────────────
function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 6 }}
      transition={{ duration: 0.13 }}
      className="absolute bottom-11 right-0 z-40 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-slate-700/60 rounded-2xl shadow-2xl shadow-black/10 p-2.5 grid grid-cols-6 gap-1"
    >
      {EMOJIS.map((e) => (
        <button key={e} onClick={() => { onSelect(e); onClose(); }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-base hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          {e}
        </button>
      ))}
    </motion.div>
  );
}

// ── Time Format ───────────────────────────────────────────────────────────────
function formatTime(ts: string) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hour}:${minute}`;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 36 }: { src?: string | null; name?: string | null; size?: number }) {
  const initials = name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const colors = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-indigo-500","bg-pink-500","bg-teal-500"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  if (src) return (
    <img src={src} alt={name || ""} width={size} height={size}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }} />
  );
  return (
    <div className={`${color} rounded-full text-white flex items-center justify-center font-semibold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

// ── Render message content with @mention highlight ───────────────────────────
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(@\w[\w\s]*)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span key={i} className="font-semibold opacity-90 underline underline-offset-2">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// ── Reply Preview (inside bubble) ─────────────────────────────────────────────
function ReplyPreview({ replyMsg, isOwn, t }: { replyMsg: Message | undefined; isOwn: boolean; t: typeof T[Lang] }) {
  if (!replyMsg) return null;
  const replyName = replyMsg.profiles?.full_name || t.user;
  const replyText = replyMsg.content ?? t.deletedPeek;
  return (
    <div className={`mb-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border-l-2 ${
      isOwn
        ? "bg-violet-700/50 border-white/40 text-white/80"
        : "bg-gray-200/70 dark:bg-slate-700/60 border-violet-400 text-gray-600 dark:text-slate-400"
    }`}>
      <p className="font-semibold mb-0.5 opacity-80">{replyName}</p>
      <p className="line-clamp-1 opacity-70">{replyText}</p>
    </div>
  );
}

// ── Delete Modal (WhatsApp style) ────────────────────────────────────────────
function DeleteModal({ isOwn, isOwnerUser, onDeleteForMe, onDeleteForAll, onClose, t }: {
  isOwn: boolean;
  isOwnerUser: boolean;
  onDeleteForMe: () => void;
  onDeleteForAll: () => void;
  onClose: () => void;
  t: typeof T[Lang];
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-80 bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-center">{t.deleteTitle}</p>
        </div>
        {(isOwn || isOwnerUser) && (
          <button
            onClick={onDeleteForAll}
            className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-b border-gray-100 dark:border-slate-700"
          >
            <Trash2 size={16} className="text-red-500 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-500">{t.deleteForAll}</p>
              <p className="text-[11px] text-gray-400 dark:text-slate-500">{t.deleteForAllSub}</p>
            </div>
          </button>
        )}
        <button
          onClick={onDeleteForMe}
          className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <Trash2 size={16} className="text-gray-500 shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.deleteForMe}</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500">{t.deleteForMeSub}</p>
          </div>
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-3 text-sm text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border-t border-gray-100 dark:border-slate-700"
        >
          {t.cancel}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Single Message Row ────────────────────────────────────────────────────────
function MessageRow({ msg, isOwn, isOwnerUser, canDelete, onDelete, onDeleteAll, onReply, messages, t }: {
  msg: Message;
  isOwn: boolean;
  isOwnerUser: boolean;
  canDelete: boolean;
  onDelete: () => void;
  onDeleteAll: () => void;
  onReply: () => void;
  messages: Message[];
  t: typeof T[Lang];
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profile = msg.profiles;
  const name = profile?.full_name || t.user;
  const isOwnerSender = msg.user_id === OWNER_ID;
  const isDeleted = msg.content === null;

  const replyTarget = msg.reply_to_id ? messages.find(m => m.id === msg.reply_to_id) : undefined;

  // Long press for mobile — opens delete modal
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      if (canDelete) setShowDeleteModal(true);
    }, 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex items-start gap-3 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        <Avatar src={profile?.avatar_url} name={name} size={36} />

        <div className={`flex flex-col gap-0.5 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
          {/* Name + badge + time */}
          <div className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            {isOwnerSender && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                  <path d="M12 2L9.09 8.26L2 9.27L7 14.14L5.82 21.02L12 17.77L18.18 21.02L17 14.14L22 9.27L14.91 8.26L12 2Z"/>
                </svg>
                {t.author}
              </span>
            )}
            <span className="text-[11px] font-semibold text-gray-600 dark:text-slate-400">
              {isOwn ? t.you : name}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-slate-600">
              {formatTime(msg.created_at)}
            </span>
          </div>

          {/* Bubble + action buttons */}
          <div className={`flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            {/* Bubble */}
            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isDeleted
                ? "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 italic"
                : isOwnerSender
                  ? "bg-violet-600 text-white rounded-tl-sm"
                  : isOwn
                    ? "bg-violet-600 text-white rounded-tr-sm"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-sm"
            }`}>
              {!isDeleted && replyTarget && (
                <ReplyPreview replyMsg={replyTarget} isOwn={isOwn} t={t} />
              )}
              {isDeleted
                ? <span>🚫 {t.deleted}</span>
                : <MessageContent content={msg.content!} />
              }
            </div>

            {/* Action buttons — hover on desktop, long-press triggers modal on mobile */}
            {!isDeleted && (
              <div className="flex items-center gap-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={onReply}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 dark:text-slate-600 hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  title="Balas"
                >
                  <CornerUpLeft size={12} />
                </button>
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 dark:text-slate-600 hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            isOwn={isOwn}
            isOwnerUser={isOwnerUser}
            onDeleteForMe={() => { onDelete(); setShowDeleteModal(false); }}
            onDeleteForAll={() => { onDeleteAll(); setShowDeleteModal(false); }}
            onClose={() => setShowDeleteModal(false)}
            t={t}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Online Badge ──────────────────────────────────────────────────────────────
function OnlineBadge({ count, t }: { count: number; t: typeof T[Lang] }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex w-1.5 h-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500" />
      </span>
      <span className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
        <Users size={10} /> {count} {t.online}
      </span>
    </div>
  );
}

// ── Mention Dropdown ──────────────────────────────────────────────────────────
function MentionDropdown({ users, query, onSelect }: {
  users: Profile[];
  query: string;
  onSelect: (name: string) => void;
}) {
  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(query.toLowerCase()) && u.full_name
  ).slice(0, 5);

  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.13 }}
      className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
    >
      {filtered.map((u) => (
        <button
          key={u.id}
          onClick={() => onSelect(u.full_name!)}
          className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
        >
          <Avatar src={u.avatar_url} name={u.full_name} size={24} />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
            {u.full_name}
          </span>
        </button>
      ))}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RoomChatPage() {
  const { lang } = useLanguage();
  const t = T[lang as Lang] ?? T.id;

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [showEmoji, setShowEmoji] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [mounted, setMounted] = useState(false);
  const [toxicError, setToxicError] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollBottom = useCallback((smooth = true) => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" }), 60);
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const fb = setTimeout(() => setLoading(false), 3000);
    return () => { subscription.unsubscribe(); clearTimeout(fb); };
  }, []);

  // ── Upsert profile ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setProfile(null); return; }
    const m = user.user_metadata;
    const p: Profile = {
      id: user.id,
      full_name: m?.full_name || m?.name || m?.user_name || null,
      avatar_url: m?.avatar_url || m?.picture || null,
    };
    setProfile(p);
    supabase.from("profiles").upsert(
      { id: p.id, full_name: p.full_name, avatar_url: p.avatar_url, email: user.email, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
  }, [user]);

  // ── Fetch messages ────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.from("messages")
      .select("id, content, created_at, user_id, reply_to_id, profiles(id, full_name, avatar_url)")
      .order("created_at", { ascending: true }).limit(100)
      .then(({ data }) => {
        if (data) { setMessages(data as unknown as Message[]); scrollBottom(false); }
      });
  }, [scrollBottom]);

  // ── Fetch all users for @mention ──────────────────────────────────────────
  useEffect(() => {
    supabase.from("profiles").select("id, full_name, avatar_url")
      .then(({ data }) => { if (data) setAllUsers(data as Profile[]); });
  }, []);

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel("room-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (p) => {
        const { data } = await supabase.from("messages")
          .select("id, content, created_at, user_id, reply_to_id, profiles(id, full_name, avatar_url)")
          .eq("id", (p.new as { id: string }).id).single();
        if (data) { setMessages(prev => [...prev, data as unknown as Message]); scrollBottom(); }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (p) => {
        const updated = p.new as { id: string; content: string | null };
        setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, content: updated.content } : m));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, (p) => {
        const deleted = p.old as { id: string };
        setMessages(prev => prev.filter(m => m.id !== deleted.id));
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [scrollBottom]);

  // ── Presence ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("presence-room", { config: { presence: { key: user.id } } });
    ch.on("presence", { event: "sync" }, () => setOnlineCount(Object.keys(ch.presenceState()).length))
      .subscribe(async (s: string) => { if (s === "SUBSCRIBED") await ch.track({ user_id: user.id }); });
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  // ── Mobile: scroll to bottom when keyboard opens ──────────────────────────
  useEffect(() => {
    const handleResize = () => scrollBottom(false);
    window.visualViewport?.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, [scrollBottom]);

  // ── Set mounted ───────────────────────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  // ── Handle input change + detect @mention ─────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    setToxicError(false); // reset error saat user ngetik lagi
    const cursor = e.target.selectionStart;
    const textUpToCursor = val.slice(0, cursor);
    const mentionMatch = textUpToCursor.match(/@(\w[\w\s]*)$/);
    if (mentionMatch) setMentionQuery(mentionMatch[1]);
    else if (textUpToCursor.endsWith("@")) setMentionQuery("");
    else setMentionQuery(null);
  };

  // Deteksi real-time untuk highlight input
  const inputHasToxic = input.trim().length > 0 && (() => { resetPatterns(); return hasToxic(input); })();

  const handleMentionSelect = (name: string) => {
    if (!inputRef.current) return;
    const cursor = inputRef.current.selectionStart;
    const textUpToCursor = input.slice(0, cursor);
    const textAfterCursor = input.slice(cursor);
    const replaced = textUpToCursor.replace(/@(\w[\w\s]*)$|@$/, `@${name} `);
    setInput(replaced + textAfterCursor);
    setMentionQuery(null);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const pos = replaced.length;
        inputRef.current.setSelectionRange(pos, pos);
      }
    }, 10);
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !user || sending) return;
    const content = input.trim();

    // ── Toxic check ──
    resetPatterns();
    if (hasToxic(content)) {
      setToxicError(true);
      setTimeout(() => setToxicError(false), 4000);
      return; // block send
    }

    setInput("");
    setMentionQuery(null);
    setReplyTo(null);
    setSending(true);
    await supabase.from("messages").insert({
      content,
      user_id: user.id,
      reply_to_id: replyTo?.id ?? null,
    });
    setSending(false);
    if (inputRef.current) inputRef.current.style.height = "auto";
    inputRef.current?.focus();
  };

  // ── Delete for me (hide locally) ─────────────────────────────────────────
  const handleDeleteForMe = (id: string) => {
    setHiddenIds(prev => new Set([...prev, id]));
  };

  // ── Delete for all (soft delete — update content to null) ─────────────────
  // ⚠️  Requires RLS policy: allow UPDATE on messages where user_id = auth.uid() OR auth.uid() = OWNER_ID
  const handleDeleteForAll = async (id: string) => {
    await supabase.from("messages").update({ content: null }).eq("id", id);
  };

  const signIn = (provider: "google" | "github") =>
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } });

  const visibleMessages = messages.filter(m => !hiddenIds.has(m.id));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900" suppressHydrationWarning>
      {!mounted ? null : (
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-10 flex flex-col">

          {/* ── Header ── */}
          <div className="mb-6 shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t.title}</h2>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                  {t.subtitle}
                </p>
              </div>
              {user && (
                <button onClick={() => supabase.auth.signOut()}
                  className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 mt-1">
                  <LogOut size={12} /> {t.signOut}
                </button>
              )}
            </div>
            <div className="mt-4 border-t border-dashed border-gray-200 dark:border-slate-700/60" />
          </div>

          {/* ── Messages ── */}
          <div
            className="space-y-5 overflow-y-auto pr-1
              [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200
              dark:[&::-webkit-scrollbar-thumb]:bg-slate-700"
            style={{ minHeight: 240, maxHeight: "calc(100svh - 300px)" }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400"
                      animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.16 }} />
                  ))}
                </div>
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center">
                  <Inbox size={20} className="text-gray-300 dark:text-slate-600" />
                </div>
                <p className="text-sm text-gray-400 dark:text-slate-500">{t.noMessages}</p>
              </div>
            ) : (
              <>
                {visibleMessages.map((msg) => (
                  <MessageRow
                    key={msg.id}
                    msg={msg}
                    messages={messages}
                    isOwn={msg.user_id === user?.id}
                    isOwnerUser={user?.id === OWNER_ID}
                    canDelete={!!user && msg.user_id === user?.id}
                    onDelete={() => handleDeleteForMe(msg.id)}
                    onDeleteAll={() => handleDeleteForAll(msg.id)}
                    onReply={() => {
                      setReplyTo(msg);
                      inputRef.current?.focus();
                      scrollBottom();
                    }}
                    t={t}
                  />
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* ── Divider ── */}
          <div className="mt-6 border-t border-dashed border-gray-200 dark:border-slate-700/60 shrink-0" />

          {/* ── Bottom ── */}
          <div className="shrink-0">
            {!user ? (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center sm:text-left">
                  {t.loginPrompt}
                  <span className="block text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {t.loginSub}
                  </span>
                </p>
                <div className="flex gap-2.5 shrink-0">
                  <button onClick={() => signIn("google")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm transition-all">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {t.loginGoogle}
                  </button>
                  <button onClick={() => signIn("github")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm transition-all">
                    <Github size={14} />
                    {t.loginGithub}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {/* Toxic error banner */}
                <AnimatePresence>
                  {toxicError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      className="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl overflow-hidden"
                    >
                      <span className="text-base shrink-0">🚫</span>
                      <div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400">{t.toxicWarning}</p>
                        <p className="text-[11px] text-red-400 dark:text-red-500 mt-0.5">{t.toxicWarningSub}</p>
                      </div>
                      <button onClick={() => setToxicError(false)} className="ml-auto shrink-0 text-red-300 hover:text-red-500 transition-colors">
                        <X size={13} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Reply bar */}
                <AnimatePresence>
                  {replyTo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-xl overflow-hidden"
                    >
                      <CornerUpLeft size={13} className="text-violet-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                          {t.replyingTo} {replyTo.profiles?.full_name || t.user}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
                          {replyTo.content ?? t.deletedPeek}
                        </p>
                      </div>
                      <button onClick={() => setReplyTo(null)} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={13} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input row */}
                <div className="flex items-end gap-3">
                  <div className="shrink-0 mb-1">
                    <Avatar src={profile?.avatar_url} name={profile?.full_name} size={34} />
                  </div>

                  <div className="flex-1 relative">
                    <AnimatePresence>
                      {mentionQuery !== null && (
                        <MentionDropdown
                          users={allUsers.filter(u => u.id !== user.id)}
                          query={mentionQuery}
                          onSelect={handleMentionSelect}
                        />
                      )}
                    </AnimatePresence>

                    <div className={`flex items-end bg-gray-50 dark:bg-slate-800 border rounded-2xl px-3.5 py-2.5 gap-2 transition-colors relative ${
                      inputHasToxic || toxicError
                        ? "border-red-400 dark:border-red-600 focus-within:border-red-500 dark:focus-within:border-red-500"
                        : "border-gray-200 dark:border-slate-700/60 focus-within:border-violet-400 dark:focus-within:border-violet-600"
                    }`}>
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onFocus={() => setTimeout(() => scrollBottom(true), 300)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") { setMentionQuery(null); return; }
                          if (e.key === "Enter" && !e.shiftKey && mentionQuery === null) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={t.placeholder}
                        rows={1}
                        className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 leading-relaxed max-h-28 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        style={{ height: "auto" }}
                        onInput={(e) => {
                          const el = e.target as HTMLTextAreaElement;
                          el.style.height = "auto";
                          el.style.height = Math.min(el.scrollHeight, 112) + "px";
                        }}
                      />
                      <div className="relative shrink-0 mb-0.5">
                        <button onClick={() => setShowEmoji(p => !p)}
                          className="text-gray-300 dark:text-slate-600 hover:text-violet-400 transition-colors">
                          <Smile size={15} />
                        </button>
                        <AnimatePresence>
                          {showEmoji && <EmojiPicker onSelect={(e) => setInput(p => p + e)} onClose={() => setShowEmoji(false)} />}
                        </AnimatePresence>
                      </div>
                    </div>
                    {/* Live toxic hint */}
                    <AnimatePresence>
                      {inputHasToxic && !toxicError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="text-[10px] text-red-400 dark:text-red-500 mt-1 pl-1 flex items-center gap-1"
                        >
                          ⚠️ {t.toxicInputHint}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    whileHover={{ scale: inputHasToxic ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={toxicError ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                    transition={toxicError ? { duration: 0.4 } : {}}
                    className={`w-10 h-10 flex items-center justify-center rounded-2xl text-white shrink-0 disabled:opacity-25 disabled:cursor-not-allowed transition-colors shadow-md mb-0.5 ${
                      inputHasToxic
                        ? "bg-red-500 hover:bg-red-600 shadow-red-500/25 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-700 shadow-violet-500/25"
                    }`}
                  >
                    <Send size={15} />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Online count + footer */}
            <div className="mt-3 flex items-center justify-between">
              {user && <OnlineBadge count={onlineCount} t={t} />}
              <p className={`text-[10px] text-gray-300 dark:text-slate-700 ${user ? "" : "w-full text-center"}`}>
                {t.footer}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}