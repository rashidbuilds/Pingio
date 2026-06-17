# ⚡ Pingio

**A high-performance, premium internet speed test engine and analyzer.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat-square)](https://github.com/pmndrs/zustand)
[![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-green?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Pingio** is a modern, premium, and privacy-first internet speed testing application built with Next.js 16 and Tailwind CSS v4. Engineered to measure real-time connection bandwidth, latency, and packet jitter directly from the browser, Pingio brings a Vercel-like and Linear-inspired sleek interface to network analysis.

Unlike generic speed tests, Pingio operates entirely on the client side, utilizing Cloudflare’s global edge server infrastructure to provide highly accurate, unthrottled performance details without the bloat of intrusive advertisements, tracker cookies, or backend servers.

---

## 🚀 Key Features

* **Precision Edge Telemetry** – Leverages Cloudflare's serverless CDN endpoints for low-overhead ping, jitter, download, and upload measurement.
* **Live Interactive Visualizations** – Real-time bandwidth charts using Recharts and Framer Motion that render network spikes and drops dynamically.
* **Robust Client-Side Engine** – Eliminates outliers using mathematical trimmed mean algorithms, matching commercial speed test quality.
* **Persistent History** – Local database-driven history log backed by IndexedDB (`idb`) so you can track and filter your past network scans offline.
* **Dynamic Network Diagnostics** – Detects OS, browser, device category, connection type, and ISP routing information via native client browser APIs.
* **Result Sharing & Export** – Generate pixel-perfect result cards instantly downloadable as PNG images (via `html2canvas`), raw JSON data exports, or copyable summary text.
* **Rich Aesthetic UI** – High-end dark/light theme options featuring custom glassmorphism, responsive grid layout, and subtle micro-animations.

---

## ⚙️ Under the Hood: How It Works

Pingio implements an advanced JavaScript engine (`lib/speedtest.ts`) that orchestrates the testing workflow through three main asynchronous phases:

### 1. Latency & Jitter (Ping Phase)
The engine executes 10 sequential fetch requests to Cloudflare's global edge network (`https://speed.cloudflare.com/__down?bytes=0`).
* **Trimmed Mean:** To avoid network spikes or CPU lag skewing the result, the top and bottom 10% of latency readings are trimmed before calculating the average.
* **Jitter Calculation:** Calculated using standard deviation among the remaining samples to estimate packet delay variation.

### 2. Download Stream
Pingio uses the modern HTTP streams API to download progressive payload chunks ranging from **500 KB to 25 MB** depending on connection throughput.
* Stream readers process raw bytes in real time inside a 12-second test window.
* In-progress throughput is continuously sampled at 50ms intervals using:
  $$\text{Speed (Mbps)} = \frac{\text{Bytes Received} \times 8}{\text{Elapsed Time (seconds)} \times 1,000,000}$$

### 3. Upload Stream
To achieve high-fidelity upload measurements without triggering browser memory errors, Pingio pre-generates a single **2 MB** binary blob using a fast Linear Congruential Generator (LCG).
* The blob is uploaded iteratively via `XMLHttpRequest` to Cloudflare's upload receiver endpoint (`https://speed.cloudflare.com/__up`) over a 12-second period.
* Native XHR upload event listeners capture progress events to compute precise real-time speed.

---

## 🛠️ Technology Stack

| Layer | Component / Library | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components & Static Site Generation |
| **Styling** | Tailwind CSS v4 + PostCSS | Modern utility-first CSS engine with CSS variables |
| **State Management** | Zustand (with localStorage persist) | Lightweight, performant client-side state container |
| **Database** | IndexedDB via `idb` | Secure, local-first key-value storage for test records |
| **Visualizations** | Recharts + Framer Motion | High-performance SVG graphing & buttery-smooth animations |
| **Export Canvas** | html2canvas | Captures DOM nodes to render shareable PNG result cards |
| **Icons** | Lucide React | Clean, scalable vector icon set |

---

## 📁 Directory Structure

```
pingio/
├── app/
│   ├── layout.tsx          # Root layout, HTML headers, & SEO metadata
│   ├── globals.css         # Tailwind v4 directives and CSS variables
│   └── page.tsx            # Main page orchestrating speed test workflow
├── components/
│   ├── ui/                 # Reusable atomic elements (button, input, etc.)
│   ├── Header.tsx          # Navigation, brand identity, and theme toggle
│   ├── SpeedDisplay.tsx    # Big numerical speedometer with spring physics
│   ├── StartButton.tsx     # Fully interactive play/stop/restart control
│   ├── TestProgress.tsx    # Step progress indicator for running stages
│   ├── LiveCharts.tsx      # Real-time Recharts stream (download & upload)
│   ├── ResultCard.tsx      # Shareable summary dashboard, PNG & JSON export
│   ├── TestHistory.tsx     # Local IndexedDB history browser and filter
│   ├── NetworkInsights.tsx # Dynamic client OS, device, browser diagnostic
│   └── ThemeProvider.tsx   # Client-side dark/light class toggler
├── lib/
│   ├── utils.ts            # Speed & latency formatters, quality ratings
│   ├── db.ts               # Local database CRUD interfaces (IndexedDB)
│   └── speedtest.ts        # Primary SpeedTestEngine thread simulator
├── store/
│   ├── testStore.ts        # Zustand orchestrator for testing phases & progress
│   └── themeStore.ts       # Theme configuration store (persistent)
├── hooks/
│   └── useDeviceInfo.ts    # User agent parser & network status listener
└── types/
    └── index.ts            # Type definitions for speeds, latencies, & results
```

---

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (Version 18.0 or higher recommended)
* `npm`, `yarn`, `pnpm` or `bun` package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rashidbuilds/pingio.git
   cd pingio
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Building for Production

Compile a highly-optimized, statically-generated production build:

```bash
npm run build
npm start
```

---

## 🔒 Privacy First

Pingio is built with user privacy as its core tenet:
* **Zero Tracker Scripts** – No third-party trackers, Google Analytics, cookies, or marketing trackers.
* **100% Client-Side** – All tests run directly in your browser.
* **Secure Storage** – Your speed test history is saved exclusively on your own machine via IndexedDB. No remote database stores or collects your IP address, coordinates, or historical logs.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Rashid Ali**
* Website: [rashidbuilds.com](https://rashidbuilds.com)
* GitHub: [@rashidbuilds](https://github.com/rashidbuilds)
* Twitter: [@rashidbuilds](https://twitter.com/rashidbuilds)
