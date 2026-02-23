import type { Metadata } from "next";
import BisnisContent from "@/app/components/bisnis/BisnisContent";

export const metadata: Metadata = {
  title: "Bisnis – Gratech | Solusi Digital Profesional",
  description:
    "Gratech menyediakan jasa pembuatan website, bot WhatsApp & Telegram, desain grafis, apps premium, SMM panel, dan PPOB. Solusi digital lengkap untuk bisnis Anda.",
  keywords: [
    "Gratech",
    "Jasa Website",
    "Bot WhatsApp",
    "Bot Telegram",
    "Jasa Desain",
    "SMM Panel",
    "PPOB",
    "Digital Agency Indonesia",
  ],
  openGraph: {
    title: "Bisnis – Gratech",
    description: "Solusi digital lengkap: website, bot, desain, apps premium, SMM & PPOB.",
    url: "https://gra-porto.vercel.app/bisnis",
    siteName: "Gra Porto",
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://gra-porto.vercel.app/bisnis",
  },
};

export default function BisnisPage() {
  return <BisnisContent />;
}