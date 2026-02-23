import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact — Galang Rizky Arridho",
  description:
    "Hubungi Galang Rizky Arridho melalui email, Instagram, LinkedIn, TikTok, atau GitHub.",
};

export default function ContactPage() {
  return <ContactContent />;
}