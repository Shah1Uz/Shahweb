# ⚡ Ultra-Premium Programmer Portfolio & CMS Admin Panel

A production-ready, full-stack personal programmer portfolio and comprehensive Content Management System (CMS) built for top-tier software engineers and product architects.

---

## 🚀 Key Highlights & Capabilities

- **Zero-Code Content Control**: Every public element (Hero, Bio, Projects, News, Articles, Skills, Audio Tracks, Experience, Testimonials, Navigation, and SEO) is editable directly from the SaaS Admin Panel.
- **Advanced Publication Scheduler & Live Countdown**:
  - Full scheduling engine that supports "Publish Now" or "Schedule for Later" with a target Date and Time.
  - Automatically displays a dynamic "Coming Soon" countdown clock (`DD : HH : MM : SS`).
  - Automatic background cron worker transitions scheduled content to `PUBLISHED` the second the target time arrives without any manual intervention!
- **Modern Developer Aesthetics**:
  - OLED High-Contrast Mode, Dark Obsidian Theme, and Minimalist Light Mode.
  - JetBrains Mono & Inter typography with custom cyber glows and glassmorphism.
  - Interactive canvas/particles and Framer Motion micro-interactions.
- **Media CMS & Storage**:
  - Drag-and-drop multi-file upload for images (JPG, PNG, WebP, SVG), video (MP4, WebM), audio (MP3, WAV), and documents (PDF).
  - Built-in image carousel with zoom lightbox, thumbnails, and autoplay.
- **Non-Intrusive Mini Audio Player**:
  - Docked widget in the bottom-left with audio visualizer, scrubber, playlist drawer, volume control, and zero auto-play on initial load.
- **Contact Inquiries CRM**:
  - Client and server Zod validated form with spam protection (honeypot), IP telemetry logging, and direct delivery to the Admin Messages Inbox.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom OLED & Cyber color system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Fetching & Cache**: TanStack Query (React Query) + Axios
- **Form Handling & Validation**: React Hook Form + Zod

### Backend (`/server`)
- **Runtime & Server**: Node.js + Express.js + TypeScript
- **Database ORM**: Prisma ORM
- **Database Engine**: Relational schema (SQLite out-of-the-box for zero-dependency local dev; drop-in switch to PostgreSQL via `DATABASE_URL`)
- **Security & Authentication**: JWT in HTTP-Only Cookies, bcrypt password hashing (12 rounds), Helmet security headers, CORS origin verification
- **Scheduler**: Node-cron background automation service
- **File Uploads**: Multer with filetype & size filtering

---

## 🔑 Initial Administrator Account

| Field | Value |
|---|---|
| **Email** | `shahuztech@gmail.com` |
| **Password** | `Shahzod177` |
| **Role** | `ADMIN` |
| **Login URL** | `http://localhost:5173/admin/login` |

> *Note: Passwords are never stored in plaintext; they are securely hashed with bcrypt salt rounds.*

---

## 💻 Quick Start & Running Locally

### 1. Backend Server Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📁 Repository Structure

```
├── client/                     # React + Vite + Tailwind + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/         # AdminLayout, SaaS sidebar, tables, modals
│   │   │   ├── audio/         # MiniAudioPlayer docked widget
│   │   │   ├── public/        # Navbar, Footer, CountdownCard, ImageCarousel, Search
│   │   │   └── ui/            # Toast, Modal, Badge, MarkdownRenderer
│   │   ├── context/           # AuthContext, ThemeContext, AudioPlayerContext
│   │   ├── lib/               # api (Axios client), utils (cn, formatters)
│   │   ├── pages/
│   │   │   ├── admin/         # Dashboard, Projects, News, Blog, Media, Audio, etc.
│   │   │   └── public/        # Home, About, Projects, News, Blog, Services, Contact
│   │   └── types/             # TypeScript definitions
│   └── vite.config.ts         # Proxy config forwarding /api and /uploads to port 5000
│
├── server/                     # Node.js + Express + Prisma + TypeScript
│   ├── prisma/
│   │   ├── schema.prisma      # Relational Prisma models
│   │   └── seed.ts            # Seed script for initial admin and portfolio data
│   ├── src/
│   │   ├── config/            # Env and PrismaClient singleton
│   │   ├── controllers/       # Auth, Projects, News, Blog, Media, Messages, etc.
│   │   ├── middleware/        # JWT auth, Multer upload, error handler
│   │   ├── routes/            # Express router endpoints
│   │   ├── services/          # Background cron publication scheduler
│   │   └── index.ts           # Server entrypoint with static uploads & sitemap
│   └── uploads/               # Stored media files
```

---

## 🌐 Dynamic XML Sitemap
A live XML sitemap compliant with Search Engine protocols is served dynamically at:
`http://localhost:5000/sitemap.xml`
It automatically queries all published projects, news, and technical blog posts.
