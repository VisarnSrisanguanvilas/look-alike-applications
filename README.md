<p align="center">
  <img src="assets/logo.png" width="150" alt="Look-Alike Logo">
</p>

<h1 align="center">Look-Alike Intelligence</h1>

<p align="center">
  <strong>Identify and analyze application look-alikes and brand impersonations across multiple stores.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

---

## 🌟 Overview

**Look-Alike Intelligence** is a cutting-edge platform designed for brand protection and user safety. It proactively scans global application stores to detect potential impersonations, phishing apps, and brand-infringing software using advanced similarity algorithms.

### Supported Stores
- 🍏 **Apple App Store**
- 🤖 **Google Play Store**
- 📦 **APKPure**
- 🅰️ **Aptoide**
- 📱 **Huawei AppGallery**

---

## ✨ Features

- **Multi-Store Intelligence**: Centralized monitoring across 5+ global app stores.
- **Similarity Scoring**: Uses `RapidFuzz` for high-performance fuzzy string matching and brand name similarity analysis.
- **Automated Scraping**: Integrated with `Playwright` and `Google Play Scraper` for real-time data retrieval.
- **Risk Assessment**: Automated calculation of threat levels for detected look-alikes.
- **Modern Dashboard**: High-performance UI built with **Next.js 15+** and **Tailwind CSS v4**.

---

## 📸 Preview

<p align="center">
  <img src="assets/Screenshot 2026-03-31 170910.png" width="100%" alt="Landing Page">
  <br>
  <em>Next-generation Threat Intelligence Dashboard</em>
</p>

<br>

<table align="center">
  <tr>
    <td align="center" width="50%">
      <img src="assets/Screenshot 2026-03-31 172153.png" width="100%" alt="App Analysis">
      <br>
      <strong>Detailed Application Analysis</strong>
    </td>
    <td align="center" width="50%">
      <img src="assets/Screenshot 2026-03-31 172229.png" width="100%" alt="Search Results">
      <br>
      <strong>Look-alike Risk Assessment</strong>
    </td>
  </tr>
</table>


---

## 🛠️ Tech Stack

### Backend (Intelligence API)
- **Framework**: FastAPI
- **Automation**: Playwright (Headless Scraping)
- **Logic**: RapidFuzz (String Similarity)
- **Network**: HTTPX & Requests

### Frontend (Security Dashboard)
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4 & Shadcn UI
- **Icons**: Lucide React
- **Language**: TypeScript

---

## 🚀 Getting Started

### 🐳 Run with Docker (Recommended)

1. **Spin up the environment**:
   ```bash
   docker compose up --build
   ```
2. **Stop the environment**:
   ```bash
   docker compose down
   ```

### 🐍 Run Locally (Development)

#### Backend
```bash
cd Backend
pip install -r requirements.txt
python main.py
```

#### Frontend
```bash
cd Frontend/look-alike
pnpm install
pnpm dev
```

---

## 📂 Project Structure

```text
.
├── Backend/               # FastAPI Intelligence API
│   ├── controllers/       # Route handlers
│   ├── schemas/           # Data models (Pydantic)
│   ├── services/          # Core business logic & Scraping
│   └── main.py            # Entry point
├── Frontend/              # Next.js Web Application
│   ├── app/               # App Router, Pages & Layouts
│   ├── components/        # UI Components (Shadcn)
│   └── lib/               # Utility functions & Axios config
├── assets/                # README images and icons
└── docker-compose.yml     # Container orchestration
```

---

<p align="center">
  Built with ❤️ for Application Security
</p>