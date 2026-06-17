# PulseTest

**Measure your network performance instantly.**

A modern, premium internet speed testing tool built with Next.js 15. PulseTest provides real-time measurements of download speed, upload speed, ping latency, and jitter in a beautifully crafted UI inspired by Linear, Vercel, and Stripe.

---

## Features

- **Real Speed Testing** — Measures download, upload, ping, and jitter using Cloudflare's speed infrastructure
- **Live Charts** — Animated real-time graphs that update as your test runs
- **Test History** — Persistent local history via IndexedDB — no server, no database required
- **Connection Insights** — Detects browser, OS, device type, and network type via browser APIs
- **Result Sharing** — Copy results, export as PNG or JSON, or share natively
- **Dark / Light Mode** — Persisted theme preference with smooth transitions
- **Mobile Responsive** — Fully responsive layout optimized for all screen sizes
- **Zero Login** — No signup, no onboarding. Open and test immediately.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| State | Zustand (with persist middleware) |
| Animation | Framer Motion |
| Charts | Recharts |
| Storage | IndexedDB via `idb` |
| Export | html2canvas |

---

## Architecture

```
pulsetest/
├── app/
│   ├── layout.tsx          # Root layout, metadata, theme init
│   ├── globals.css         # CSS variables (light/dark tokens)
│   └── page.tsx            # Main page — test orchestration
├── components/
│   ├── ui/                 # Primitive UI components (button, badge, tooltip)
│   ├── Header.tsx          # Logo + theme toggle
│   ├── SpeedDisplay.tsx    # Large animated speed number
│   ├── StartButton.tsx     # Animated play/stop/restart button
│   ├── TestProgress.tsx    # Phase indicator + progress bar
│   ├── LiveCharts.tsx      # Real-time recharts (download/upload/latency)
│   ├── ResultCard.tsx      # Final results with share/export actions
│   ├── TestHistory.tsx     # IndexedDB-backed history list
│   ├── NetworkInsights.tsx # Device/browser/network API display
│   ├── ThemeProvider.tsx   # DOM class syncer for dark mode
│   └── Footer.tsx          # Branding + links
├── lib/
│   ├── utils.ts            # cn(), formatSpeed(), ratings
│   ├── db.ts               # IndexedDB CRUD via idb
│   └── speedtest.ts        # SpeedTestEngine class
├── store/
│   ├── testStore.ts        # Zustand store for test state
│   └── themeStore.ts       # Zustand store for theme (persisted)
├── hooks/
│   └── useDeviceInfo.ts    # Network Information API + UA parsing
└── types/
    └── index.ts            # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/rashidbuilds/pulsetest.git
cd pulsetest
npm install
npm run dev
```

Open http://localhost:3000 — the speed test loads immediately.

### Production Build

```bash
npm run build
npm start
```

---

## Deployment

### Vercel (Recommended)

```bash
npx vercel --prod
```

Or connect the GitHub repo to vercel.com for automatic deployments.

---

## Privacy

- No tracking, no analytics, no cookies
- All test data stays on your device in IndexedDB
- No accounts — nothing is sent to any server except the speed test payloads to Cloudflare's public speed infrastructure

---

## Author

Built and Designed by Rashid Ali
- Portfolio: https://rashidbuilds.com
- GitHub: https://github.com/rashidbuilds
