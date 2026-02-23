import type { Metadata } from "next";
import ContentClient from "./ContentClient";

export const metadata: Metadata = {
  title: "Konten — Galang Rizky Arridho",
  description:
    "Konten Instagram Galang Rizky Arridho seputar web development, Next.js, Laravel, dan tips coding.",
  openGraph: {
    title: "Konten — Galang Rizky Arridho",
    description:
      "Ikuti konten web development, tips coding, dan keseharian sebagai developer di Instagram @galangrizky.id",
    url: "https://gra-porto.vercel.app/content",
    siteName: "Gra Porto",
    locale: "id_ID",
    type: "website",
  },
};

export default function ContentPage() {
  return <ContentClient />;
}