
# General Project Overview

This repository contains a full-stack platform with a Next.js frontend and a Node.js/Express backend, designed for deployment on Vercel. It supports real-time chat, AI-powered chatbot (Gemini), and premium doctor-patient messaging.

---

# Frontend (Next.js)

## Local Development

1. Navigate to the frontend directory:
  ```bash
  cd frontend
  ```
2. Install dependencies:
  ```bash
  npm install
  ```
3. Create a `.env.local` file with:
  ```env
  NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
  NEXT_PUBLIC_WS_URL=http://localhost:5000
  ```
4. Start the development server:
  ```bash
  npm run dev
  ```

## Vercel Deployment

- Set the project root to `frontend` in Vercel.
- Build Command: `npm run build`
- Output Directory: (default for Next.js)
- Environment Variables:
  - `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-vercel>.vercel.app/api`
  - `NEXT_PUBLIC_WS_URL` (optional, only if using a persistent WebSocket backend)

---

# Backend (Node.js/Express)

## Local Development

1. Navigate to the backend directory:
  ```bash
  cd backend
  ```
2. Install dependencies:
  ```bash
  npm install
  ```
3. Create a `.env` file with:
  ```env
  MONGODB_URI=your-mongodb-uri
  GEMINI_API_KEY=your-gemini-api-key
  FRONTEND_URL=http://localhost:3000
  ```
4. Start the backend server:
  ```bash
  npm run dev
  ```

## Vercel Deployment

- Set the project root to `backend` in Vercel.
- Framework Preset: `Other`
- Entry Point: `server.js`
- Environment Variables:
  - `MONGODB_URI`
  - `GEMINI_API_KEY`
  - `FRONTEND_URL=https://<your-frontend-vercel>.vercel.app`

---

# General Deployment Notes

- Deploy both `frontend` and `backend` as separate Vercel projects from the same repository.
- The root `vercel.json` routes API requests to the backend and all other requests to the frontend.
- For local development, the frontend proxies API requests to the backend using the `NEXT_PUBLIC_API_BASE_URL` variable.
- WebSocket support is available locally; Vercel serverless does not support persistent WebSocket connections. The frontend will fall back gracefully if WebSocket is unavailable.

---

For any issues, check the browser console (frontend) or server logs (backend) for errors. Ensure all environment variables are set correctly in both local and Vercel environments.
