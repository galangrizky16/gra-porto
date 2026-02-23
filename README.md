# 🌐 Gra Porto — Portfolio Galang Rizky Arridho

Portfolio personal berbasis web yang dibangun dengan **Next.js 15**, **TypeScript**, dan **Supabase** — menampilkan profil, karier, pendidikan, proyek, dan pencapaian secara dinamis dengan dukungan multi-bahasa (ID/EN) dan dark mode.

🔗 **Live Demo:** [gra-porto.vercel.app](https://gra-porto.vercel.app)

---

## ✨ Fitur

- **Multi-bahasa** — Toggle antara Bahasa Indonesia dan English secara real-time
- **Dark / Light Mode** — Tanpa flash saat pertama load (anti-FOUC via inline script)
- **Control Panel Admin** — Kelola seluruh konten portfolio via dashboard `/admin`
- **Realtime Update** — Data di-fetch dengan SWR (stale-while-revalidate) setiap 5 detik
- **Animasi Halus** — Menggunakan Framer Motion untuk page transition & scroll reveal
- **Navigation Progress** — Indikator loading saat berpindah halaman
- **Fully Responsive** — Layout mobile-first dengan sidebar navigasi di desktop

### Halaman Publik
| Route | Deskripsi |
|---|---|
| `/` | Halaman utama — profil & skill |
| `/tentang` | Tentang saya — bio, karier, pendidikan |
| `/pencapaian` | Pencapaian & sertifikasi |
| `/bisnis` | Layanan bisnis |
| `/proyek` | Showcase proyek |
| `/content` | Konten & media |
| `/roomchat` | Chat room |
| `/kontak` | Halaman kontak |

### Control Panel (`/admin`)
- Manage Home — edit profil, bio, dan skill stack
- Manage Tentang — edit karier & pendidikan
- Autentikasi via Supabase Auth

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animasi | Framer Motion |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Data Fetching | SWR + Axios |
| Icons | Lucide React, React Icons (Si) |
| Font | Geist Sans, Geist Mono, Caveat |
| Deployment | Vercel |

---

## 🚀 Cara Menjalankan Lokal

### 1. Clone repository

```bash
git clone https://github.com/username/gra-porto.git
cd gra-porto
```

### 2. Install dependencies

```bash
npm install
# atau
yarn install
```

### 3. Setup environment variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Setup database Supabase

Jalankan SQL schema yang diperlukan di Supabase SQL Editor. Tabel yang dibutuhkan:

- `home_profile` — data profil & bio
- `home_skills` — daftar skill/tech stack
- `tentang_profile` — bio halaman tentang
- `tentang_karier` — data karier
- `tentang_pendidikan` — data pendidikan

### 5. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📁 Struktur Project

```
app/
├── (public)/           # Halaman publik portfolio
│   ├── page.tsx        # Home
│   ├── tentang/        # Tentang Saya
│   ├── pencapaian/     # Pencapaian
│   ├── bisnis/         # Bisnis
│   ├── proyek/         # Proyek
│   ├── content/        # Content
│   ├── roomchat/       # Room Chat
│   └── kontak/         # Kontak
├── admin/              # Control Panel
│   ├── layout.tsx      # Admin layout (sidebar auto-hide di auth page)
│   ├── page.tsx        # Admin home
│   ├── auth/           # Login page
│   └── components/     # Sidebar, Header, Footer admin
├── components/         # Shared components
│   ├── ClientLayout.tsx
│   ├── FloatingWidgets.tsx
│   ├── FloatingSettings.tsx
│   ├── Navbar.tsx
│   └── NavigationProgress.tsx
├── providers/          # ThemeProvider, LanguageContext
└── lib/
    └── supabase/       # Supabase client (server & browser)
```

---

## 🌍 Multi-bahasa

Konten disimpan di Supabase dalam dua kolom JSONB:
- `content_id` — konten Bahasa Indonesia
- `content_en` — konten Bahasa Inggris

Toggle bahasa tersedia di navbar dan mengubah seluruh konten secara real-time tanpa reload halaman.

---

## 🔐 Admin

Akses control panel di `/admin/auth/login` menggunakan akun Supabase Auth. Sidebar admin otomatis tersembunyi di halaman login.

---

## 📦 Build & Deploy

```bash
npm run build
npm run start
```

Project ini di-deploy di **Vercel** dengan zero-config. Cukup connect repository ke Vercel dan tambahkan environment variables di dashboard Vercel.

---

## 📄 Lisensi

Project ini dibuat untuk keperluan portfolio pribadi. Silakan gunakan sebagai referensi, namun mohon tidak menggunakan konten (foto, bio, data pribadi) tanpa izin.

---

<div align="center">
  <p>Dibuat dengan ❤️ oleh <strong>Galang Rizky Arridho</strong></p>
  <p>
    <a href="https://gra-porto.vercel.app">Website</a> •
    <a href="https://github.com/galangrizkyarridho">GitHub</a>
  </p>
</div>