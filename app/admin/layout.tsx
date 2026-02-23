import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/providers";
import { LanguageProvider } from "@/app/providers/LanguageContext";
import ClientLayout from "@/app/components/ClientLayout";
import FloatingWidgets from "@/app/components/FloatingWidgets";
import NavigationProgress from "@/app/components/NavigationProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ── Site Config ───────────────────────────────────────────────────────────────
const SITE_URL  = "https://www.galangrizkyarridho.my.id/"; // ← ganti dengan domain kamu
const SITE_NAME = "Galang Rizky Arridho";
const HANDLE    = "@GRA";
const OG_IMAGE  = `${SITE_URL}/og-image.png`; // 1200×630 px

// ── Root Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  // ── Basic ──────────────────────────────────────────────────────────────────
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Portfolio`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Portfolio Galang Rizky Arridho — Software developer, content creator, dan entrepreneur muda Indonesia. Lihat proyek, pencapaian, dan bisnis saya.",
  keywords: [
    "Galang Rizky Arridho",
    "GRA",
    "portfolio",
    "developer Indonesia",
    "software developer",
    "web developer",
    "content creator",
    "entrepreneur",
    "Next.js",
    "React",
    "TypeScript",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // ── Canonical & Alternates ─────────────────────────────────────────────────
  alternates: {
    canonical: SITE_URL,
    languages: {
      "id-ID": SITE_URL,
      "en-US": `${SITE_URL}/en`,
    },
  },

  // ── Open Graph ─────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Portfolio`,
    description:
      "Software developer, content creator, dan entrepreneur muda Indonesia.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Portfolio`,
        type: "image/png",
      },
    ],
  },

  // ── Twitter / X Card ───────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: HANDLE,
    creator: HANDLE,
    title: `${SITE_NAME} — Portfolio`,
    description:
      "Software developer, content creator, dan entrepreneur muda Indonesia.",
    images: [OG_IMAGE],
  },

  // ── Robots ────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Icons ─────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg",    type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },

  // ── Manifest ──────────────────────────────────────────────────────────────
  manifest: "/site.webmanifest",

  // ── Verification (tambahkan token dari Google/Bing Search Console) ─────────
  verification: {
    // google: "xxxx",
    // yandex: "xxxx",
    // bing: "xxxx",
  },

  // ── App specific ──────────────────────────────────────────────────────────
  applicationName: `${SITE_NAME} Portfolio`,
  referrer: "origin-when-cross-origin",
  category: "portfolio",
};

// ── Viewport (dipisah dari metadata sesuai Next.js 14+) ───────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ── JSON-LD Structured Data ───────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  alternateName: "GRA",
  url: SITE_URL,
  image: `${SITE_URL}/assets/profile.png`,
  jobTitle: "Software Developer & Content Creator",
  nationality: "Indonesian",
  sameAs: [
    // Tambahkan link sosial media kamu di sini
    // "https://github.com/username",
    // "https://linkedin.com/in/username",
    // "https://instagram.com/username",
  ],
  knowsAbout: [
    "Web Development",
    "React",
    "Next.js",
    "TypeScript",
    "Content Creation",
    "Entrepreneurship",
  ],
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

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        // Mencegah layout shift saat font dimuat
        style={{ fontSynthesis: "none" }}
      >
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