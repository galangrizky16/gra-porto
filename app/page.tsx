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
    url: "https://www.galangrizkyarridho.my.id/",
    siteName: "Galang Rizky Arridho",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "https://www.galangrizkyarridho.my.id/og-image.png",
        width: 2400,
        height: 1260,
        alt: "Galang Rizky Arridho — Web Developer & Designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galang Rizky Arridho — Web Developer",
    description:
      "Seorang Web Developer dan kreator konten coding yang berdedikasi untuk membangun solusi digital yang berdampak.",
    images: ["https://www.galangrizkyarridho.my.id/og-image.png"],
  },
};

export default function Home() {
  return <HomeContent />;
}