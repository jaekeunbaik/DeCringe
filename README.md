# ⚡ Antidote for Flex / CringeGuard AI

> The witty, sarcastic AI defibrillator that strips humble-brags and corporate cringe from social media posts—replacing them with authentically human rewrites.

[![Vercel](https://img.shields.io/badge/Vercel-Deploy_Ready-000000?style=flat&logo=vercel)](https://de-cringe.vercel.app)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat&logo=google)](https://aistudio.google.com)

---

## 🎯 Key Features

- **🚩 Cringe Score Meter:** Visual 0–100% obnoxiousness gauge with dynamic alert levels.
- **🤡 One-Line Roast:** Savage, witty one-sentence critique of performative posts.
- **✨ 3 Human-Voice Rewrites:**
  - **'The Human' (100% Casual):** Coffee-shop human tone.
  - **'The Punchy Dev':** Short, direct, value-focused tech X/Twitter tone.
  - **'The Pro Natural':** Professional & authentic tone without performative fluff.
- **⚡ 1-Click Test Presets:** Test instantly with curated LinkedIn humblebrag & tech thread samples.
- **☕ Ko-fi Coffee Integration:** Embedded tip panel & floating chat widget.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Tech Brutalist Theme)
- **AI Engine:** Google Gemini 2.5 API (`@google/genai`)
- **Deployment:** Vercel (Stateless & Serverless)

---

## 🔑 Environment Variables Setup

Configure the following environment variables in your Vercel Project Settings:

```bash
# Required for AI analysis
GEMINI_API_KEY="your_google_gemini_api_key"

# Optional: Real-time Discord Webhook notifications
DISCORD_WEBHOOK_URL="your_discord_webhook_url"
```

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
