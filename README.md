# 🐙 OMS Intelligence v2

> **AI-powered Order Management System** for e-commerce operations — built with FastAPI, React, Shopify, and Groq LLM.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://oms-intelligence-v2-nyymvgnfs-oms-intelligence.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple?style=for-the-badge&logo=railway)](https://oms-intelligence-v2-production.up.railway.app/health)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Saumyata-Tiwari/oms-intelligence-v2)

---

## 🎯 What is OMS Intelligence?

OMS Intelligence v2 is a **production-grade AI operations dashboard** that helps e-commerce store managers monitor orders, track SLA compliance, and get instant AI-powered insights — all in one place.

**Otto** 🐙 — the AI assistant — answers natural language questions about orders, SLA status, revenue, and customer issues in real time, powered by Groq's `llama-3.3-70b-versatile` model.

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| 🤖 **Otto AI Chat** | Natural language Q&A about orders, SLA, revenue using Groq LLM + RAG |
| 📦 **Live Orders** | Real-time Shopify order ingestion via webhooks |
| 📊 **Analytics Dashboard** | KPI cards, orders over time, sentiment trend, SLA distribution, channel split |
| ⚠️ **SLA Tracking** | Auto-calculates deadlines, detects breaches, triggers WhatsApp alerts |
| 📱 **Twilio WhatsApp** | Automated SLA breach alerts sent to store manager's WhatsApp |
| 📧 **Email Automation** | N8N workflows for new order notifications and stockout alerts |
| 🔐 **JWT Auth** | Role-based access (Store Associate, Fulfillment Manager, Ops Lead) |
| 🌙 **Dark/Light Mode** | Full theme support across all tabs |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│              React TypeScript + Recharts                 │
│     Dashboard | Chat | Orders | Analytics                │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│                   BACKEND (Railway)                      │
│                FastAPI + PostgreSQL                      │
│   Auth | Chat | Orders | Analytics | Webhooks           │
└──────┬───────────────┬──────────────────────────────────┘
       │               │
┌──────▼──────┐ ┌──────▼──────────────────────────────────┐
│   Shopify   │ │              AUTOMATION                  │
│  Webhooks   │ │  N8N Workflows:                          │
│  Dev Store  │ │  • SLA Breach → Twilio WhatsApp          │
└─────────────┘ │  • New Order → Email                     │
                │  • Stockout → Email                      │
                └──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    AI LAYER                              │
│  Groq llama-3.3-70b-versatile (LLM)                    │
│  FAISS Vector Store (RAG)                               │
│  Sentiment Analysis                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

**Backend:**
- FastAPI + SQLAlchemy (async) + PostgreSQL (Railway)
- Groq API (`llama-3.3-70b-versatile`)
- LangChain + FAISS (RAG)
- JWT Authentication + bcrypt
- Twilio WhatsApp API

**Frontend:**
- React TypeScript
- Recharts (data visualization)
- Inline styles with dark/light theme

**Integrations:**
- Shopify Partners Dev Store (webhooks)
- N8N (workflow automation)
- Twilio (WhatsApp alerts)
- Railway (PostgreSQL + backend hosting)
- Vercel (frontend hosting)

---

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.11
- Node.js 18+
- PostgreSQL

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `.env` file:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/oms_v2
OPENROUTER_API_KEY=your_groq_api_key
OPENROUTER_BASE_URL=https://api.groq.com/openai/v1
OPENROUTER_MODEL=llama-3.3-70b-versatile
SECRET_KEY=your-secret-key
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-shopify-token
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+91XXXXXXXXXX
```

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

### N8N Setup
```bash
npx n8n
# Open http://localhost:5678
# Import workflows from /n8n-workflows folder
```

---

## 📁 Project Structure

```
oms-intelligence-v2/
├── backend/
│   ├── app/
│   │   ├── routers/          # FastAPI routes (auth, chat, orders, analytics, webhooks)
│   │   ├── services/         # Business logic (AI, RAG, SLA, N8N, sentiment)
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── core/             # Security, prompts
│   ├── data/
│   │   └── faiss_index/      # FAISS vector store
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   └── src/
│       └── components/       # Dashboard, Chat, Orders, Analytics, Login
└── README.md
```

---

## 🔄 N8N Automation Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| SLA Breach Alert | Every 5 min (scheduled) | Fetch breached orders → Twilio WhatsApp |
| New Order Notification | Shopify webhook | Send email to store manager |
| Stockout Alert | Every 5 min (scheduled) | Check low stock → Send email |

---

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Otto AI Chat
![Chat](screenshots/chat.png)

### Orders
![Orders](screenshots/orders.png)

### Analytics
![Analytics](screenshots/analytics.png)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://oms-intelligence-v2-nyymvgnfs-oms-intelligence.vercel.app |
| Backend API | https://oms-intelligence-v2-production.up.railway.app |
| Health Check | https://oms-intelligence-v2-production.up.railway.app/health |

**Demo Credentials:**
- Username: `saumyata`
- Password: `password123`

---

## 👩‍💻 About

Built by **Saumyata Tiwari** — B.Tech CSE graduate from IPS Academy, Indore.

Portfolio project demonstrating full-stack AI product development:
- AI/ML integration (LLM, RAG, sentiment analysis)
- Production deployment (Railway + Vercel)
- Real-world integrations (Shopify, Twilio, N8N)
- Modern UI/UX design

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/saumyata-tiwari)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/Saumyata-Tiwari)