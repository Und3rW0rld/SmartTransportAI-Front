# SmartTransport AI — Frontend

Web client for the **Integrated Intelligent System for Prediction, Classification, and Recommendation in the Transport Company**. Built as part of a deep learning project at Universidad Nacional de Colombia.

## Overview

This application integrates three AI-powered modules into a single dashboard:

| Module | Description | Data source |
|--------|-------------|-------------|
| Demand Prediction | Forecasts passenger demand per route for the next 30 days using a time-series LSTM model | Mock (ready to connect) |
| Distracted Driving Classification | Classifies driver behavior from images (phone use, drowsiness, etc.) | Live API |
| Travel Recommendation | Suggests personalized destinations based on user travel history using collaborative filtering | Mock (ready to connect) |

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** — build tool and dev server
- **Tailwind CSS v3** — utility-first styling
- **shadcn/ui** (Radix UI primitives) — accessible components
- **Recharts** — demand forecast chart
- **Lucide React** — icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & run

```bash
npm install
npm run dev
```

App will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── ui/              # Reusable UI primitives (Button, Card, Tabs)
├── data/
│   └── mockData.ts      # Simulated data for demand and recommendation modules
├── lib/
│   └── utils.ts         # cn() helper for class merging
├── modules/
│   ├── DemandPrediction.tsx       # Module 1 — time series forecast
│   ├── DriverClassification.tsx   # Module 2 — image classification
│   └── TravelRecommendation.tsx   # Module 3 — destination recommender
├── App.tsx              # Root layout with tab navigation
├── main.tsx             # Entry point
└── index.css            # Tailwind base + CSS variables (dark theme)
```

## API Integration

### Driver Distraction Classification (live)

**Endpoint:** `POST https://driver-distraction-api-production.up.railway.app/predict`

**Request:** `multipart/form-data` with a single `file` field (JPG or PNG image).

**Response:**

```json
{
  "class": "using_phone",
  "danger_level": "HIGH",
  "confidence": 0.91,
  "probabilities": {
    "safe_driving": 0.02,
    "using_phone": 0.91,
    "turning": 0.05,
    "others": 0.02
  }
}
```

| Field | Description |
|-------|-------------|
| `class` | Predicted behavior class |
| `danger_level` | `LOW`, `MEDIUM`, or `HIGH` |
| `confidence` | Model confidence for the top class (0–1) |
| `probabilities` | Per-class probability distribution |

### Demand Prediction & Recommendations (mock)

Both modules currently use simulated data defined in `src/data/mockData.ts`. To connect a real backend, replace the data calls in the corresponding module component with a `fetch` call to your endpoint.

## Environment Variables

No environment variables are required to run the app. If you need to override the API base URL, add a `.env.local` file:

```env
VITE_DISTRACTION_API_URL=https://your-api-url/predict
```

Then update the `API_URL` constant in `src/modules/DriverClassification.tsx`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
