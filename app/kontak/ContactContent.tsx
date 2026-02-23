"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useTheme } from "@/app/providers";
import { useLanguage } from "@/app/providers/LanguageContext";
import {
  SiGmail,
  SiInstagram,
  SiLinkedin,
  SiTiktok,
  SiGithub,
} from "react-icons/si";
import { ArrowUpRight, Send, CheckCircle2, Loader2 } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const t = {
  id: {
    pageTitle: "Kontak",
    pageSubtitle: "Mari terhubung.",
    sectionLabel: "Temukan saya di media sosial",
    cards: [
      { title: "Hubungi via Email", subtitle: "Kirim email untuk pertanyaan atau kolaborasi.", buttonLabel: "Buka Gmail" },
      { title: "Ikuti Perjalanan Saya", subtitle: "Ikuti perjalanan kreatif saya.", buttonLabel: "Buka Instagram" },
      { title: "Mari Terhubung", subtitle: "Terhubung secara profesional.", buttonLabel: "Buka LinkedIn" },
      { title: "Ikuti Serunya", subtitle: "Tonton konten seru dan menarik.", buttonLabel: "Buka TikTok" },
      { title: "Jelajahi Kode", subtitle: "Lihat proyek open-source saya.", buttonLabel: "Buka GitHub" },
    ],
    form: {
      title: "Kirimkan Pesan",
      subtitle: "Isi form di bawah dan saya akan segera membalas.",
      labelName: "Nama", labelEmail: "Email", labelMessage: "Pesan",
      placeholderName: "Nama kamu", placeholderEmail: "email@kamu.com", placeholderMessage: "Tulis pesanmu di sini...",
      buttonSend: "Kirim Pesan", buttonSending: "Mengirim...",
      successTitle: "Pesan terkirim!",
      successSubtitle: "Terima kasih, saya akan segera menghubungi kamu.",
      successRetry: "Kirim pesan lain →",
    },
  },
  en: {
    pageTitle: "Contact",
    pageSubtitle: "Let's get in touch.",
    sectionLabel: "Find me on social media",
    cards: [
      { title: "Stay in Touch", subtitle: "Reach out via email for inquiries or collaborations.", buttonLabel: "Go to Gmail" },
      { title: "Follow My Journey", subtitle: "Follow my creative journey.", buttonLabel: "Go to Instagram" },
      { title: "Let's Connect", subtitle: "Connect with me professionally.", buttonLabel: "Go to LinkedIn" },
      { title: "Join the Fun", subtitle: "Watch engaging and fun content.", buttonLabel: "Go to TikTok" },
      { title: "Explore the Code", subtitle: "Explore my open-source work.", buttonLabel: "Go to GitHub" },
    ],
    form: {
      title: "Send a Message",
      subtitle: "Fill in the form below and I'll get back to you soon.",
      labelName: "Name", labelEmail: "Email", labelMessage: "Message",
      placeholderName: "Your name", placeholderEmail: "email@you.com", placeholderMessage: "Write your message here...",
      buttonSend: "Send Message", buttonSending: "Sending...",
      successTitle: "Message sent!",
      successSubtitle: "Thank you, I'll reach out to you shortly.",
      successRetry: "Send another message →",
    },
  },
};

const cardMeta = [
  { href: "mailto:rizkygalang729@gmail.com", gradient: "from-red-700 via-red-600 to-red-500", icon: SiGmail, span: "full" as const },
  { href: "https://www.instagram.com/kyydeveloper_id/", gradient: "from-purple-600 via-pink-500 to-orange-400", icon: SiInstagram, span: "half" as const },
  { href: "https://linkedin.com/in/galang-rizky-arridho", gradient: "from-sky-600 via-blue-600 to-blue-700", icon: SiLinkedin, span: "half" as const },
  { href: "https://www.tiktok.com/@kyydeveloper_id", gradient: "from-zinc-800 via-zinc-900 to-black", icon: SiTiktok, span: "half" as const },
  { href: "https://github.com/galangrizky16", gradient: "from-slate-700 via-slate-800 to-slate-900", icon: SiGithub, span: "half" as const },
];

function SocialCard({
  index, title, subtitle, buttonLabel, href, gradient, icon: Icon, span,
}: {
  index: number; title: string; subtitle: string; buttonLabel: string;
  href: string; gradient: string; icon: React.ElementType; span: "full" | "half";
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between min-h-40 shadow-sm cursor-pointer group ${
        span === "full" ? "col-span-2" : "col-span-1"
      }`}
    >
      <div className={`absolute inset-0 bg-linear-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <Icon
        className="absolute right-5 bottom-4 opacity-15 group-hover:opacity-25 transition-opacity duration-300"
        style={{ width: 82, height: 82 }}
      />
      <div className="relative z-10 flex flex-col gap-1">
        <h3 className="text-white font-bold text-lg leading-snug">{title}</h3>
        <p className="text-white/70 text-sm">{subtitle}</p>
      </div>
      <div className="relative z-10 mt-4">
        <span className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors duration-200 text-white text-sm font-semibold px-4 py-2 rounded-xl backdrop-blur-sm">
          {buttonLabel}
          <ArrowUpRight size={13} />
        </span>
      </div>
    </motion.a>
  );
}

function ContactForm({ f }: { f: typeof t["id"]["form"] }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const inputClass =
    "w-full rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 " +
    "border-gray-200 dark:border-slate-700 " +
    "bg-gray-50 dark:bg-slate-800/60 " +
    "text-gray-900 dark:text-slate-100 " +
    "placeholder-gray-400 dark:placeholder-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="mt-10 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 bg-gray-50/60 dark:bg-slate-800/30"
    >
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-1 text-gray-900 dark:text-slate-100">
          {f.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {f.subtitle}
        </p>
      </div>

      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-10 gap-3"
        >
          <CheckCircle2 size={40} className="text-emerald-500" />
          <p className="font-semibold text-base text-gray-800 dark:text-slate-100">
            {f.successTitle}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {f.successSubtitle}
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-2 text-xs text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            {f.successRetry}
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                {f.labelName}
              </label>
              <input
                type="text"
                placeholder={f.placeholderName}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                {f.labelEmail}
              </label>
              <input
                type="email"
                placeholder={f.placeholderEmail}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
              {f.labelMessage}
            </label>
            <textarea
              placeholder={f.placeholderMessage}
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              {status === "loading" ? (
                <><Loader2 size={14} className="animate-spin" />{f.buttonSending}</>
              ) : (
                <><Send size={14} />{f.buttonSend}</>
              )}
            </motion.button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

export default function ContactContent() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === "dark";
  const text = t[lang];

  return (
    <main className="min-h-screen transition-colors duration-200 bg-white dark:bg-[#0f172a]">
      <div className="w-full max-w-2xl px-6 py-10 md:py-14">

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-1 text-gray-900 dark:text-slate-100">
            {text.pageTitle}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {text.pageSubtitle}
          </p>
          <div className="mt-4 border-t border-dashed border-gray-200 dark:border-slate-700" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="text-xs font-medium uppercase tracking-widest mb-4 text-gray-400 dark:text-slate-500"
        >
          {text.sectionLabel}
        </motion.p>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {cardMeta.map((meta, i) => (
            <SocialCard
              key={meta.href}
              index={i}
              title={text.cards[i].title}
              subtitle={text.cards[i].subtitle}
              buttonLabel={text.cards[i].buttonLabel}
              href={meta.href}
              gradient={meta.gradient}
              icon={meta.icon}
              span={meta.span}
            />
          ))}
        </div>

        <ContactForm f={text.form} />
      </div>
    </main>
  );
}