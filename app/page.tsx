import type { Metadata } from "next";
import HomeContent from "./components/home/HomeContent";

export const metadata: Metadata = {
  title: "Galang Rizky Arridho — Web Developer & Coding Content Creator",
  description:
    "Portfolio Galang Rizky Arridho. Web Developer berpengalaman dalam Next.js, Laravel, PHP, dan TypeScript. Berdomisili di Jakarta Timur, Indonesia.",
  openGraph: {
    title: "Galang Rizky Arridho — Web Developer",
    description:
      "Seorang Web Developer dan kreator konten coding yang berdedikasi untuk membangun solusi digital yang berdampak.",
    url: "https://gra-porto.vercel.app",
    siteName: "Gra Porto",
    locale: "id_ID",
    type: "website",
  },
};

export default function Home() {
  return <HomeContent />;
}