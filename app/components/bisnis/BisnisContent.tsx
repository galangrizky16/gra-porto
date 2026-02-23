"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/app/providers/LanguageContext";
import {
  Globe, Bot, Palette, Smartphone, TrendingUp, CreditCard,
  ArrowUpRight, Zap, ChevronRight,
} from "lucide-react";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
`;

// ── i18n ──────────────────────────────────────────────────────────────────────
const i18n = {
  id: {
    eyebrow: "Tentang Bisnis",
    heroTitle: ["Solusi Digital", "Tanpa Kompromi"],
    heroSub: "Gratech hadir untuk membantu bisnis dan individu berkembang di era digital — dari website, bot otomatis, hingga layanan digital lengkap.",
    heroCta: "Kunjungi Gratech",
    heroNote: "gratech.com",

    servicesEyebrow: "Layanan Kami",
    servicesTitle: "Apa yang kami kerjakan",
    servicesSub: "Rangkaian layanan digital terintegrasi untuk mendorong pertumbuhan bisnis Anda.",

    services: [
      { title: "Jasa Website", desc: "Landing page, company profile, toko online, hingga sistem web enterprise yang custom dan responsif.", tag: "Web" },
      { title: "Bot WhatsApp & Telegram", desc: "Automasi bisnis dengan bot pintar — customer service, notifikasi order, hingga sistem CRM berbasis chat.", tag: "Bot" },
      { title: "Jasa Desain", desc: "Branding, UI/UX, konten sosial media, dan materi pemasaran yang estetik dan on-brand.", tag: "Design" },
      { title: "Apps Premium", desc: "Akses aplikasi premium dengan harga terjangkau — produktivitas, kreativitas, dan keamanan digital.", tag: "Apps" },
      { title: "SMM Panel", desc: "Social Media Marketing panel untuk boost followers, likes, views, dan engagement di berbagai platform.", tag: "SMM" },
      { title: "PPOB", desc: "Pembayaran pulsa, token listrik, BPJS, dan tagihan lainnya dalam satu platform terintegrasi.", tag: "PPOB" },
    ],

    clientsEyebrow: "Klien & Mitra",
    clientsTitle: "Dipercaya berbagai pihak",
    clientsSub: "Dari startup hingga institusi pendidikan — kami bangga telah melayani.",

    ctaTitle: "Siap memulai proyek bersama?",
    ctaSub: "Lihat portfolio lengkap, harga layanan, dan konsultasi gratis di website resmi Gratech.",
    ctaBtn: "Buka gratech.com",
    ctaNote: "Konsultasi gratis · Respon cepat · Hasil profesional",
  },
  en: {
    eyebrow: "About the Business",
    heroTitle: ["Digital Solutions", "Without Compromise"],
    heroSub: "Gratech is here to help businesses and individuals thrive in the digital era — from websites and automated bots to complete digital services.",
    heroCta: "Visit Gratech",
    heroNote: "gratech.com",

    servicesEyebrow: "Our Services",
    servicesTitle: "What we do",
    servicesSub: "An integrated suite of digital services to drive your business growth.",

    services: [
      { title: "Website Development", desc: "Landing pages, company profiles, online stores, and custom enterprise web systems — all responsive.", tag: "Web" },
      { title: "WhatsApp & Telegram Bots", desc: "Automate your business with smart bots — customer service, order notifications, and chat-based CRM.", tag: "Bot" },
      { title: "Design Services", desc: "Branding, UI/UX, social media content, and marketing materials that are aesthetic and on-brand.", tag: "Design" },
      { title: "Premium Apps", desc: "Access premium applications at affordable prices — productivity, creativity, and digital security.", tag: "Apps" },
      { title: "SMM Panel", desc: "Social Media Marketing panel to boost followers, likes, views, and engagement across platforms.", tag: "SMM" },
      { title: "PPOB", desc: "Pay for mobile credits, electricity tokens, BPJS, and other bills in one integrated platform.", tag: "PPOB" },
    ],

    clientsEyebrow: "Clients & Partners",
    clientsTitle: "Trusted by many",
    clientsSub: "From startups to educational institutions — we're proud to have served them.",

    ctaTitle: "Ready to start a project together?",
    ctaSub: "See the full portfolio, service pricing, and free consultation at the official Gratech website.",
    ctaBtn: "Open gratech.com",
    ctaNote: "Free consultation · Fast response · Professional results",
  },
};

// ── Service icons ─────────────────────────────────────────────────────────────
const SERVICE_ICONS = [Globe, Bot, Palette, Smartphone, TrendingUp, CreditCard];

const SERVICE_COLORS = [
  { bg: "bg-sky-50 dark:bg-sky-900/20", icon: "text-sky-500", border: "border-sky-100 dark:border-sky-800/40", tag: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400" },
  { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-500", border: "border-emerald-100 dark:border-emerald-800/40", tag: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-violet-50 dark:bg-violet-900/20", icon: "text-violet-500", border: "border-violet-100 dark:border-violet-800/40", tag: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" },
  { bg: "bg-purple-50 dark:bg-purple-900/20", icon: "text-purple-500", border: "border-purple-100 dark:border-purple-800/40", tag: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" },
  { bg: "bg-rose-50 dark:bg-rose-900/20", icon: "text-rose-500", border: "border-rose-100 dark:border-rose-800/40", tag: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400" },
  { bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: "text-indigo-500", border: "border-indigo-100 dark:border-indigo-800/40", tag: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" },
];

// ── Client logos ──────────────────────────────────────────────────────────────
const CLIENT_LOGOS = [
  { src: "/assets/karir/logo.png", alt: "Client 1" },
  { src: "/assets/karir/logo1.png", alt: "Client 2" },
  { src: "/assets/karir/logo2.png", alt: "Client 3" },
  { src: "/assets/karir/logo3.png", alt: "Client 4" },
  { src: "/assets/karir/image.png", alt: "Client 5" },
  { src: "/assets/karir/logo-auladi.png", alt: "Auladi" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function ScrollReveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionEyebrow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-5 h-px bg-purple-500" />
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-500 dark:text-purple-400"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {text}
      </span>
    </div>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection({ t }: { t: typeof i18n.id }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={ref} className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* Animated background grid */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Amber glow top-right */}
        <div className="absolute -top-40 -right-40 w-150 h-150 rounded-full bg-purple-400/10 dark:bg-purple-400/5 blur-[100px]" />
        {/* Slate glow bottom-left */}
        <div className="absolute -bottom-40 -left-20 w-125 h-125 rounded-full bg-slate-400/10 dark:bg-slate-700/20 blur-[80px]" />
      </motion.div>

      {/* Decorative vertical line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-purple-400/30 to-transparent dark:via-purple-400/20 ml-8 md:ml-14 hidden md:block" />

      <div className="relative z-10 px-6 py-20 md:py-28 md:px-14 w-full">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <ScrollReveal delay={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-900/20">
                <Zap size={12} className="text-purple-500" />
                <span
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 tracking-wide"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {t.eyebrow}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                gratech.com
              </div>
            </div>
          </ScrollReveal>

          {/* Main title */}
          <div className="mb-6 overflow-hidden">
            {t.heroTitle.map((line, i) => (
              <ScrollReveal key={i} delay={0.1 + i * 0.08} y={40}>
                <h1
                  className={`leading-[1.05] font-extrabold tracking-tight ${
                    i === 0
                      ? "text-5xl md:text-7xl lg:text-8xl text-gray-900 dark:text-white"
                      : "text-5xl md:text-7xl lg:text-8xl text-purple-500 dark:text-purple-400"
                  }`}
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {line}
                </h1>
              </ScrollReveal>
            ))}
          </div>

          {/* Sub */}
          <ScrollReveal delay={0.28}>
            <p
              className="text-base md:text-lg text-gray-500 dark:text-slate-400 leading-relaxed max-w-xl mb-10"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t.heroSub}
            </p>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={0.36}>
            <div className="flex flex-wrap items-center gap-4">
              <motion.a
                href="https://gratech.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-gray-900 font-semibold text-sm shadow-lg shadow-purple-500/25 transition-colors duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t.heroCta}
                <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.a>

              <span
                className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Globe size={12} />
                {t.heroNote}
              </span>
            </div>
          </ScrollReveal>
        </div>

        {/* Gratech logo — large decorative */}
        <ScrollReveal delay={0.2} className="absolute right-6 md:right-14 top-1/2 -translate-y-1/2 hidden lg:block">
          <div className="relative w-64 h-64 xl:w-80 xl:h-80">
            {/* Outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-purple-300/30 dark:border-purple-400/20"
            />
            {/* Inner ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full border border-dashed border-gray-200/50 dark:border-slate-700/50"
            />
            {/* Floating dots */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-purple-500"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${deg}deg) translateX(120px) translateY(-50%)`,
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gray-200 dark:via-slate-700/60 to-transparent" />
    </section>
  );
}

// ── Services Section ──────────────────────────────────────────────────────────
function ServicesSection({ t }: { t: typeof i18n.id }) {
  return (
    <section className="px-6 py-20 md:py-28 md:px-14 relative">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/5 dark:bg-purple-500/3 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-5xl">
        <ScrollReveal delay={0}>
          <SectionEyebrow text={t.servicesEyebrow} />
          <h2
            className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {t.servicesTitle}
          </h2>
          <p
            className="text-sm text-gray-500 dark:text-slate-400 max-w-lg mb-12"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t.servicesSub}
          </p>
        </ScrollReveal>

        {/* Grid: 3 cols desktop, 2 mobile, first card wider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.services.map((svc, i) => {
            const Icon = SERVICE_ICONS[i];
            const color = SERVICE_COLORS[i];
            const isFirst = i === 0;

            return (
              <ScrollReveal key={i} delay={0.06 * i} className={isFirst ? "lg:col-span-1" : ""}>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`group relative h-full rounded-2xl border p-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 ${color.bg} ${color.border} overflow-hidden`}
                >
                  {/* Noise texture overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />

                  <div className="relative">
                    {/* Tag */}
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-4 ${color.tag}`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {svc.tag}
                    </span>

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white/70 dark:bg-slate-900/40`}>
                      <Icon size={20} className={color.icon} />
                    </div>

                    {/* Content */}
                    <h3
                      className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {svc.title}
                    </h3>
                    <p
                      className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {svc.desc}
                    </p>

                    {/* Arrow hint on hover */}
                    <motion.div
                      className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <ChevronRight size={16} className={`${color.icon} opacity-60`} />
                    </motion.div>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* More at gratech */}
        <ScrollReveal delay={0.2} className="mt-8">
          <a
            href="https://gratech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <span>Lihat semua layanan di gratech.com</span>
            <ArrowUpRight size={14} />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Clients Section ───────────────────────────────────────────────────────────
function ClientsSection({ t }: { t: typeof i18n.id }) {
  return (
    <section className="px-6 py-20 md:py-28 md:px-14 relative border-t border-gray-100 dark:border-slate-800/60">
      <div className="max-w-5xl">
        <ScrollReveal delay={0}>
          <SectionEyebrow text={t.clientsEyebrow} />
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {t.clientsTitle}
          </h2>
          <p
            className="text-sm text-gray-500 dark:text-slate-400 mb-12"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t.clientsSub}
          </p>
        </ScrollReveal>

        {/* Logo strip */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {CLIENT_LOGOS.map((logo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                whileHover={{ scale: 1.06, y: -2 }}
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 p-3"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain p-2.5"
                  sizes="96px"
                />
              </motion.div>
            ))}

            {/* "And more" pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: CLIENT_LOGOS.length * 0.08, duration: 0.4 }}
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/30 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-xl font-bold text-gray-400 dark:text-slate-600" style={{ fontFamily: "'Syne', sans-serif" }}>+</span>
              <span className="text-[10px] text-gray-400 dark:text-slate-600 font-medium text-center leading-tight px-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>dan masih banyak lagi</span>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────────────────────
function CtaSection({ t }: { t: typeof i18n.id }) {
  return (
    <section className="px-6 pb-24 md:pb-32 md:px-14">
      <div className="max-w-5xl">
        <ScrollReveal delay={0}>
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gray-900 dark:bg-slate-800" />
            {/* Amber glow */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-[60px]" />
            <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-purple-400/10 rounded-full blur-[50px]" />
            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10 px-8 py-14 md:px-14 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="max-w-lg">
                <h2
                  className="text-2xl md:text-4xl font-bold text-white leading-snug mb-3"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {t.ctaTitle}
                </h2>
                <p
                  className="text-sm text-gray-300 leading-relaxed mb-4"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {t.ctaSub}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {t.ctaNote.split(" · ").map((note, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {i > 0 && <span className="text-gray-600">·</span>}
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              <motion.a
                href="https://gratech.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="group shrink-0 inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-purple-500 hover:bg-purple-400 text-gray-900 font-bold text-sm shadow-lg shadow-purple-500/20 transition-colors duration-200 whitespace-nowrap"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Globe size={18} />
                {t.ctaBtn}
                <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function BisnisContent() {
  const { lang } = useLanguage();
  const t = i18n[lang];

  return (
    <>
      <style>{fontImport}</style>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <HeroSection t={t} />
        <ServicesSection t={t} />
        <ClientsSection t={t} />
        <CtaSection t={t} />
      </div>
    </>
  );
}