import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { LanguageProvider } from "./providers/LanguageContext";
import ClientLayout from "./components/ClientLayout";
import FloatingWidgets from "./components/FloatingWidgets";
import NavigationProgress from "./components/NavigationProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://www.galangrizkyarridho.my.id/"; // Ganti dengan domain kamu

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // ── Basic ──────────────────────────────────────────────
  title: {
    default: "Galang Rizky Arridho – Portfolio",
    template: "%s | Galang Rizky Arridho",
  },
  description:
    "Portfolio Galang Rizky Arridho – Web Developer & Designer yang berfokus pada pengalaman pengguna modern, performa tinggi, dan desain yang bersih.",
  keywords: [
    "Galang Rizky Arridho",
    "portfolio",
    "web developer",
    "frontend developer",
    "Next.js",
    "React",
    "Indonesia",
  ],
  authors: [{ name: "Galang Rizky Arridho", url: BASE_URL }],
  creator: "Galang Rizky Arridho",
  publisher: "Galang Rizky Arridho",

  // ── Canonical & Robots ────────────────────────────────
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Open Graph (Facebook, WhatsApp, LinkedIn, dll) ────
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Galang Rizky Arridho – Portfolio",
    title: "Galang Rizky Arridho – Portfolio",
    description:
      "Web Developer & Designer yang berfokus pada pengalaman pengguna modern, performa tinggi, dan desain yang bersih.",
    images: [
      {
        url: "/og-image.png", // Taruh file 1200x630px di folder /public
        width: 1200,
        height: 630,
        alt: "Galang Rizky Arridho – Portfolio",
      },
    ],
    locale: "id_ID",
  },

  // ── Twitter / X Card ─────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Galang Rizky Arridho – Portfolio",
    description:
      "Web Developer & Designer yang berfokus pada pengalaman pengguna modern, performa tinggi, dan desain yang bersih.",
    images: ["/og-image.png"],
    // creator: "@username_twitter_kamu", // Uncomment jika punya
  },

  // ── Icons ─────────────────────────────────────────────
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // ── Manifest (PWA) ────────────────────────────────────
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

/*
 * Script ini diinjeksikan SEBELUM apapun di-render.
 * Tujuannya: set background-color langsung di <html> dan <body>
 * via inline style SEBELUM CSS di-parse, agar tidak ada flash putih.
 */
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('gra-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = theme === 'dark' || (!theme && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#0f172a';
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.backgroundColor = '#ffffff';
      document.documentElement.style.colorScheme = 'light';
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Script harus di posisi paling awal di <head> agar jalan sebelum paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <LanguageProvider>
            <NavigationProgress />
            <ClientLayout>
              {children}
            </ClientLayout>
            <FloatingWidgets />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}