# AuraShop - AI-Driven Online Shopping Management System

Welcome to **AuraShop**, a full-stack, intelligent e-commerce platform that goes far beyond basic keyword search. By merging an extremely aesthetic, glassmorphic UI with dynamic AI logic, this platform proactively understands user intent, rates the credibility of reviews, and actively steps in to minimize buyer's regret.

## Modules Built

1. **User Management**: Secure JWT authentication and role-based access.
2. **AI Intent Analysis**: Our NLP engine parses abstract searches ("I need a laptop under 500 urgently") and filters the database by extracting constraints and urgency.
3. **Price Tracking & Dashboard**: Define a monthly shopping budget via the interactive dashboard and create real-time price-drop alerts.
4. **Trust-Weighted Reviews**: Say goodbye to spam! An AI pipeline grades reviews based on length, verification status, and sentiment—calculating an explicit 'Trust Score' for every comment.
5. **Predictive Regret Minimization**: Try to impulse-buy something expensive? The backend mechanically profiles the purchase price against your remaining personal budget and dynamically halts checkout to warn you of potential regret.

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4 (Stunning dark mode gradients and micro-interactions)
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite (Development) -> PostgreSQL Ready
- **AI Core**: Custom NLP Heuristics (Designed for simple deployment scaling to HuggingFace Transformers logic)

## How to Run Locally

### 1. Start the Backend
Open a terminal and navigate to the `/backend` folder:
```bash
cd backend
pip install "fastapi[all]" sqlalchemy pydantic passlib bcrypt python-jose
python -m uvicorn main:app --reload
```

### 2. Start the Frontend
Open a new terminal and navigate to the `/frontend` folder:
```bash
cd frontend
npm install
npm run dev
```

### 3. Generate Seed Data
If you don't have any products showing up, run our python seed script from the backend to instantly inject 1,000 randomized AI intent items!
```bash
cd backend
python seed_data.py
```

Then visit `http://localhost:3000` to dive right in!