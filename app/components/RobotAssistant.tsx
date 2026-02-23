"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Konstanta ────────────────────────────────────────────────────────────────
const CHAT_MESSAGES = [
  "Halo! 👋 Saya GRA Bot.",
  "Ada yang ingin kamu tanyakan?",
  "Login dulu yuk biar kamu bisa chat! 🚀",
];

const SIZE = 72;
const PUPIL_MAX = 3;
const IDLE_TIMEOUT = 2000;

type User = {
  name: string;
  email: string;
  avatar: string;
};

// ── Robot Head SVG — Helm putih, visor hitam, mata UNGU glowing ──────────────
function RobotHead({ pupil, blinking }: { pupil: { x: number; y: number }; blinking: boolean }) {
  const px = Math.max(-PUPIL_MAX, Math.min(PUPIL_MAX, pupil.x));
  const py = Math.max(-PUPIL_MAX, Math.min(PUPIL_MAX, pupil.y));

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <defs>
        {/* Helm putih 3D */}
        <radialGradient id="helm-grad" cx="38%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#e8deff" />
          <stop offset="100%" stopColor="#b8a0d8" />
        </radialGradient>
        {/* Highlight glossy */}
        <radialGradient id="helm-gloss" cx="32%" cy="20%" r="45%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        {/* Visor hitam */}
        <radialGradient id="visor-grad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a1035" />
          <stop offset="100%" stopColor="#08040f" />
        </radialGradient>
        {/* Mata ungu */}
        <radialGradient id="eye-grad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="45%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        {/* Speaker/telinga */}
        <radialGradient id="ear-grad" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#2d1a4a" />
          <stop offset="100%" stopColor="#0d0820" />
        </radialGradient>
        {/* Glow ungu */}
        <filter id="eye-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Rim glow */}
        <filter id="rim-glow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Antena glow */}
        <filter id="ant-glow">
          <feGaussianBlur stdDeviation="1" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Drop shadow helm */}
        <filter id="helm-shadow">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#4c1d95" floodOpacity="0.45" />
        </filter>
        <clipPath id="helm-clip">
          <ellipse cx="50" cy="52" rx="36" ry="40" />
        </clipPath>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="96" rx="24" ry="4" fill="rgba(76,29,149,0.2)" />

      {/* Antena */}
      <line x1="50" y1="12" x2="50" y2="5" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="4" r="3" fill="#a855f7" filter="url(#ant-glow)" opacity="0.9" />
      <circle cx="50" cy="4" r="1.5" fill="#e9d5ff" />

      {/* Speaker kiri */}
      <ellipse cx="10" cy="50" rx="8" ry="11" fill="url(#ear-grad)" />
      <ellipse cx="10" cy="50" rx="8" ry="11" fill="none" stroke="#a855f7" strokeWidth="1.2" opacity="0.75" filter="url(#rim-glow)" />
      <ellipse cx="10" cy="50" rx="4.5" ry="6.5" fill="#0d0820" />
      <ellipse cx="10" cy="50" rx="4.5" ry="6.5" fill="none" stroke="#9333ea" strokeWidth="0.8" opacity="0.8" filter="url(#rim-glow)" />
      <circle cx="10" cy="50" r="2" fill="#a855f7" opacity="0.5" filter="url(#eye-glow)" />

      {/* Speaker kanan */}
      <ellipse cx="90" cy="50" rx="8" ry="11" fill="url(#ear-grad)" />
      <ellipse cx="90" cy="50" rx="8" ry="11" fill="none" stroke="#a855f7" strokeWidth="1.2" opacity="0.75" filter="url(#rim-glow)" />
      <ellipse cx="90" cy="50" rx="4.5" ry="6.5" fill="#0d0820" />
      <ellipse cx="90" cy="50" rx="4.5" ry="6.5" fill="none" stroke="#9333ea" strokeWidth="0.8" opacity="0.8" filter="url(#rim-glow)" />
      <circle cx="90" cy="50" r="2" fill="#a855f7" opacity="0.5" filter="url(#eye-glow)" />

      {/* Helm utama */}
      <ellipse cx="50" cy="52" rx="36" ry="40" fill="url(#helm-grad)" filter="url(#helm-shadow)" />

      <g clipPath="url(#helm-clip)">
        {/* Visor hitam */}
        <rect x="16" y="35" width="68" height="34" rx="10" fill="url(#visor-grad)" />
        {/* Rim ungu mengelilingi visor */}
        <rect x="16" y="35" width="68" height="34" rx="10" fill="none"
          stroke="#a855f7" strokeWidth="1.8" opacity="0.9" filter="url(#rim-glow)" />
        {/* Inner rim */}
        <rect x="19" y="38" width="62" height="28" rx="8" fill="none"
          stroke="#7c3aed" strokeWidth="0.7" opacity="0.5" />
        {/* Refleksi kaca */}
        <rect x="20" y="37" width="60" height="6" rx="5" fill="rgba(255,255,255,0.07)" />

        {/* Mata */}
        {blinking ? (
          <>
            <rect x="24" y="49" width="20" height="3" rx="1.5" fill="#a855f7" opacity="0.9" />
            <rect x="56" y="49" width="20" height="3" rx="1.5" fill="#a855f7" opacity="0.9" />
          </>
        ) : (
          <>
            {/* Mata kiri */}
            <ellipse cx={34 + px} cy={51 + py} rx="12" ry="10" fill="#a855f7" opacity="0.12" filter="url(#eye-glow)" />
            <ellipse cx={34 + px} cy={51 + py} rx="11" ry="9" fill="none"
              stroke="#a855f7" strokeWidth="1.2" opacity="0.75" filter="url(#rim-glow)" />
            <ellipse cx={34 + px} cy={51 + py} rx="9.5" ry="7.5" fill="url(#eye-grad)" opacity="0.92" />
            {/* Grid */}
            <line x1={24.5 + px} y1={51 + py} x2={43.5 + px} y2={51 + py}
              stroke="rgba(192,132,252,0.3)" strokeWidth="0.5" />
            <line x1={34 + px} y1={43.5 + py} x2={34 + px} y2={58.5 + py}
              stroke="rgba(192,132,252,0.3)" strokeWidth="0.5" />
            {/* Pupil */}
            <ellipse cx={34 + px} cy={51 + py} rx="4.5" ry="3.5" fill="#1e0a3c" />
            <circle cx={35.8 + px} cy={49.4 + py} r="1.5" fill="white" opacity="0.88" />
            <circle cx={33 + px} cy={52.5 + py} r="0.7" fill="white" opacity="0.4" />

            {/* Mata kanan */}
            <ellipse cx={66 + px} cy={51 + py} rx="12" ry="10" fill="#a855f7" opacity="0.12" filter="url(#eye-glow)" />
            <ellipse cx={66 + px} cy={51 + py} rx="11" ry="9" fill="none"
              stroke="#a855f7" strokeWidth="1.2" opacity="0.75" filter="url(#rim-glow)" />
            <ellipse cx={66 + px} cy={51 + py} rx="9.5" ry="7.5" fill="url(#eye-grad)" opacity="0.92" />
            <line x1={56.5 + px} y1={51 + py} x2={75.5 + px} y2={51 + py}
              stroke="rgba(192,132,252,0.3)" strokeWidth="0.5" />
            <line x1={66 + px} y1={43.5 + py} x2={66 + px} y2={58.5 + py}
              stroke="rgba(192,132,252,0.3)" strokeWidth="0.5" />
            <ellipse cx={66 + px} cy={51 + py} rx="4.5" ry="3.5" fill="#1e0a3c" />
            <circle cx={67.8 + px} cy={49.4 + py} r="1.5" fill="white" opacity="0.88" />
            <circle cx={65 + px} cy={52.5 + py} r="0.7" fill="white" opacity="0.4" />
          </>
        )}

        {/* Senyum ungu */}
        <rect x="30" y="72" width="40" height="12" rx="6" fill="rgba(76,29,149,0.15)" />
        <path d="M37 76 Q50 82 63 76" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" />
      </g>

      {/* Gloss */}
      <ellipse cx="50" cy="52" rx="36" ry="40" fill="url(#helm-gloss)" />
      {/* Border */}
      <ellipse cx="50" cy="52" rx="35.5" ry="39.5" fill="none"
        stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <ellipse cx="50" cy="52" rx="35.5" ry="39.5" fill="none"
        stroke="rgba(168,85,247,0.2)" strokeWidth="2" />
    </svg>
  );
}

// ── Typing Dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3.5 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── Bot Avatar Mini ───────────────────────────────────────────────────────────
function BotAvatar({ size = 22 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #2d1a4a 0%, #0d0820 100%)",
        boxShadow: "0 0 8px rgba(168,85,247,0.45)",
      }}
    >
      <svg viewBox="0 0 100 100" style={{ width: size * 0.9, height: size * 0.9 }}>
        <ellipse cx="50" cy="52" rx="36" ry="40" fill="#e8deff" />
        <rect x="18" y="37" width="64" height="30" rx="9" fill="#08040f" />
        <rect x="18" y="37" width="64" height="30" rx="9" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.85" />
        <ellipse cx="35" cy="52" rx="9" ry="7" fill="#a855f7" opacity="0.9" />
        <ellipse cx="65" cy="52" rx="9" ry="7" fill="#a855f7" opacity="0.9" />
        <ellipse cx="35" cy="52" rx="4" ry="3" fill="#1e0a3c" />
        <ellipse cx="65" cy="52" rx="4" ry="3" fill="#1e0a3c" />
        <circle cx="36.5" cy="50.5" r="1.2" fill="white" opacity="0.9" />
        <circle cx="66.5" cy="50.5" r="1.2" fill="white" opacity="0.9" />
      </svg>
    </div>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({
        name: "Pengguna",
        email: "user@gmail.com",
        avatar: "https://ui-avatars.com/api/?name=User&background=5b21b6&color=e9d5ff&size=64",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-5 pt-3"
    >
      <div className="flex flex-col items-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3 shadow-inner">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
            <rect x="3" y="11" width="18" height="11" rx="3" stroke="#a855f7" strokeWidth="1.8" />
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Login untuk mulai chat</p>
        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 text-center">
          Masuk agar bisa mengirim pesan
        </p>
      </div>

      <motion.button
        onClick={(e) => { e.stopPropagation(); handleGoogleLogin(); }}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
        whileTap={{ scale: loading ? 1 : 0.97 }}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-100 text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full"
          />
        ) : (
          <svg viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.2 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8H6.4C9.7 35.6 16.3 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.2 5.2C39.3 36.3 44 30.7 44 24c0-1.3-.1-2.7-.4-3.9z" />
          </svg>
        )}
        <span>{loading ? "Menghubungkan..." : "Lanjutkan dengan Google"}</span>
      </motion.button>

      <p className="text-[10px] text-gray-400 dark:text-slate-600 text-center mt-3">
        🔒 Data kamu aman dan tidak akan dibagikan
      </p>
    </motion.div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Message = { id: string; text: string; from: "bot" | "user" };

// ── Chat Screen ───────────────────────────────────────────────────────────────
function ChatScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: `Halo ${user.name}! 👋 Ada yang bisa saya bantu?`, from: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((p) => [...p, { id: Date.now().toString(), text, from: "user" }]);
    setInput("");
    setBotTyping(true);
    setTimeout(() => {
      setBotTyping(false);
      setMessages((p) => [
        ...p,
        { id: (Date.now() + 1).toString(), text: "Terima kasih! Galang akan segera membalas kamu 🙏", from: "bot" },
      ]);
    }, 1400);
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-3.5 py-2 border-b border-gray-100 dark:border-slate-700/60">
        <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-violet-300/40" />
        <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-1 truncate font-medium">{user.email}</span>
        <button
          onClick={onLogout}
          className="text-[10px] text-violet-500 hover:text-violet-700 dark:text-violet-400 font-semibold px-1.5 py-0.5 rounded-lg hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="px-3 py-3 space-y-2.5 max-h-52 overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.from === "bot" && <BotAvatar size={22} />}
              {msg.from === "user" && (
                <img src={user.avatar} className="w-5.5 h-5.5 rounded-full object-cover shrink-0" alt="" />
              )}
              <div
                className={`rounded-2xl px-3 py-2 max-w-[78%] text-[12px] leading-relaxed ${
                  msg.from === "bot"
                    ? "bg-gray-50 dark:bg-slate-800 rounded-bl-sm text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700"
                    : "bg-linear-to-br from-violet-500 to-purple-700 rounded-br-sm text-white"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {botTyping && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2">
            <BotAvatar size={22} />
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-slate-700">
              <TypingDots />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 pb-3.5">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-600 px-3.5 py-2.5 focus-within:border-violet-400 dark:focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200/30 transition-all duration-200">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ketik pesan..."
            className="flex-1 text-[12px] bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500"
          />
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88 }}
            className="w-7 h-7 rounded-xl bg-linear-to-br from-violet-500 to-purple-700 disabled:opacity-30 flex items-center justify-center shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="white" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      </div>
    </>
  );
}

// ── ChatModal — SELALU KE ATAS ────────────────────────────────────────────────
function ChatModal({ onClose }: { onClose: () => void }) {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [typing, setTyping] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) return;
    let i = 0;
    const next = () => {
      if (i >= CHAT_MESSAGES.length) { setTyping(false); return; }
      setTyping(true);
      const delay = 900 + CHAT_MESSAGES[i].length * 20;
      setTimeout(() => {
        setVisibleMessages(i + 1);
        i++;
        setTyping(i < CHAT_MESSAGES.length);
        if (i < CHAT_MESSAGES.length) setTimeout(next, 400);
        else setTyping(false);
      }, delay);
    };
    const t = setTimeout(next, 300);
    return () => clearTimeout(t);
  }, [user]);

  useEffect(() => {
    // Delay pasang listener supaya tidak langsung tertrigger saat modal baru dibuka
    const timer = setTimeout(() => {
      const onDown = (e: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
      };
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, 200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label="Chat dengan GRA Bot"
      initial={{ opacity: 0, scale: 0.9, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 14 }}
      transition={{ duration: 0.26, ease: [0.34, 1.12, 0.64, 1] }}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute z-30 w-72"
      style={{ bottom: 82, right: -14 }}
    >
      <div className="rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/25 border border-violet-100/60 dark:border-slate-700/80 bg-white dark:bg-slate-900">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-linear-to-r from-violet-700 to-purple-800">
          <div className="w-9 h-9 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-8 h-8">
              <ellipse cx="50" cy="52" rx="36" ry="40" fill="#e8deff" />
              <rect x="18" y="37" width="64" height="30" rx="9" fill="#08040f" />
              <rect x="18" y="37" width="64" height="30" rx="9" fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.9" />
              <ellipse cx="35" cy="52" rx="10" ry="8" fill="#a855f7" opacity="0.9" />
              <ellipse cx="65" cy="52" rx="10" ry="8" fill="#a855f7" opacity="0.9" />
              <ellipse cx="35" cy="52" rx="4.5" ry="3.5" fill="#1e0a3c" />
              <ellipse cx="65" cy="52" rx="4.5" ry="3.5" fill="#1e0a3c" />
              <circle cx="36.5" cy="50.5" r="1.5" fill="white" opacity="0.9" />
              <circle cx="66.5" cy="50.5" r="1.5" fill="white" opacity="0.9" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-bold leading-tight">GRA Bot</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
              <p className="text-violet-200 text-[10px]">Online sekarang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup chat"
            className="w-7 h-7 rounded-xl flex items-center justify-center text-violet-200 hover:text-white hover:bg-white/20 transition-all duration-150"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div key="pre-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-3.5 py-3.5 space-y-2.5 min-h-18">
                <AnimatePresence>
                  {CHAT_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-end gap-2"
                    >
                      <BotAvatar size={22} />
                      <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[82%]">
                        <p className="text-[12px] text-gray-700 dark:text-gray-200 leading-relaxed">{msg}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {typing && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
                    <BotAvatar size={22} />
                    <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-bl-sm">
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="h-px bg-gray-100 dark:bg-slate-700/60" />
              <LoginScreen onLogin={setUser} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChatScreen user={user} onLogout={() => setUser(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tail ke bawah → menunjuk ke robot */}
      <div
        className="absolute"
        style={{
          bottom: -7,
          right: 28,
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid white",
          filter: "drop-shadow(0 3px 4px rgba(76,29,149,0.15))",
        }}
      />
    </motion.div>
  );
}

// ── Posisi ────────────────────────────────────────────────────────────────────
const FS_RIGHT = 24;
const FS_BOTTOM = 24;
const FS_BTN_SIZE = 48;
const MENU_ITEM_H = 52;
const MENU_PADDING = 16;
const SOCIAL_COUNT = 4;
const GAP_TO_BTN = 12;
const ROBOT_H = SIZE;
const ROBOT_W = SIZE;

// ── Main Export ───────────────────────────────────────────────────────────────
export default function RobotAssistant({ settingsOpen = false }: { settingsOpen?: boolean }) {
  const [open, setOpen] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  const mousePos = useRef({ x: -9999, y: -9999 });
  const lastMouseMove = useRef(Date.now());
  const idleTarget = useRef({ x: 0, y: 0 });

  const menuHeight = SOCIAL_COUNT * MENU_ITEM_H + MENU_PADDING + GAP_TO_BTN;
  const robotRight = FS_RIGHT + (FS_BTN_SIZE - ROBOT_W) / 2;
  const robotBottomIdle = FS_BOTTOM + FS_BTN_SIZE + 10;
  const robotBottomOpen = robotBottomIdle + menuHeight;
  const robotBottom = settingsOpen ? robotBottomOpen : robotBottomIdle;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      lastMouseMove.current = Date.now();
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let raf: number;
    const loop = () => {
      const robotX = window.innerWidth - robotRight - ROBOT_W / 2;
      const robotY = window.innerHeight - robotBottom + ROBOT_H / 2;
      const isIdle = Date.now() - lastMouseMove.current > IDLE_TIMEOUT;
      if (isIdle) {
        const t = idleTarget.current;
        setPupil((p) => ({ x: p.x + (t.x - p.x) * 0.055, y: p.y + (t.y - p.y) * 0.055 }));
      } else {
        const dx = mousePos.current.x - robotX;
        const dy = mousePos.current.y - robotY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = (dx / dist) * Math.min(PUPIL_MAX, dist * 0.1);
        const ny = (dy / dist) * Math.min(PUPIL_MAX, dist * 0.1);
        setPupil((p) => ({ x: p.x + (nx - p.x) * 0.1, y: p.y + (ny - p.y) * 0.1 }));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mounted, robotRight, robotBottom]);

  useEffect(() => {
    const cycle = (): ReturnType<typeof setTimeout> => {
      const t = setTimeout(() => {
        const a = Math.random() * Math.PI * 2;
        idleTarget.current = { x: Math.cos(a) * (PUPIL_MAX * 0.6), y: Math.sin(a) * (PUPIL_MAX * 0.6) };
        return cycle();
      }, 2500 + Math.random() * 3500);
      return t;
    };
    const t = cycle();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const cycle = (): ReturnType<typeof setTimeout> => {
      const t = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => { setBlinking(false); cycle(); }, 130);
      }, 3000 + Math.random() * 4500);
      return t;
    };
    const t = cycle();
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={{
        right: robotRight,
        bottom: robotBottom,
        width: ROBOT_W,
        height: ROBOT_H,
        transition: "bottom 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <AnimatePresence>
        {open && <ChatModal key="chat" onClose={() => setOpen(false)} />}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((p) => !p)}
        aria-label="Open chat"
        aria-expanded={open}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ y: { repeat: Infinity, duration: 3.2, ease: "easeInOut" } }}
        className="relative pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
        style={{
          width: ROBOT_W,
          height: ROBOT_H,
          filter: open
            ? "drop-shadow(0 0 16px rgba(168,85,247,0.75)) drop-shadow(0 4px 12px rgba(76,29,149,0.55))"
            : "drop-shadow(0 6px 18px rgba(76,29,149,0.4)) drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
        }}
      >
        <RobotHead pupil={pupil} blinking={blinking} />
      </motion.button>
    </div>
  );
}