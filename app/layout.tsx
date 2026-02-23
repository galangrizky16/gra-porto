import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Gra Porto",
  description: "Portfolio Galang Rizky Arridho",
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