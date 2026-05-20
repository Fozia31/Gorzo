# Gorzo

## Overview

**Gorzo** is a full-stack healthcare platform combining a Next.js frontend with a Node.js/Express backend. It delivers a modern doctor–patient experience that includes:

- user, doctor, and admin management
- content publishing and engagement
- AI-powered conversational assistance
- premium doctor messaging
- payment processing
- real-time WebSocket updates

The repository is structured as two separate apps:

- `frontend/` — Next.js + React UI
- `backend/` — Express API server with MongoDB and WebSocket support

---

## Key Features

- Authentication and role-based access for users, doctors, and admins
- Post creation, comments, and engagement tracking
- Doctor advice content management
- Real-time chat and premium messaging using Socket.IO
- AI conversation endpoint powered by Gemini
- Personal assistance workflows and inquiries
- Payment transaction handling
- File upload handling and public file serving

---

## Architecture

### Frontend

The frontend is built with:

- Next.js 16
- React 19
- Tailwind CSS
- Radix UI primitives
- Socket.IO client
- Axios for REST API calls
- Vercel-ready configuration

It interacts with the backend through environment-configured API and WebSocket endpoints.

### Backend

The backend is built with:

- Node.js + Express 5
- MongoDB via Mongoose
- Socket.IO for real-time messaging
- Google Gemini generative AI integration
- Multer file uploads
- CORS guarded for frontend origins

### API Structure

The backend exposes REST endpoints under `/api`:

- `/api/users`
- `/api/admins`
- `/api/doctors`
- `/api/posts`
- `/api/comments`
- `/api/doctor-advice`
- `/api/post-engagements`
- `/api/chats`
- `/api/messages`
- `/api/ai-conversations`
- `/api/personal-assistance`
- `/api/payments`

The backend also serves uploaded files from `/uploads`.

### Real-time Messaging

WebSocket support is initialized in `backend/websocket.js` and provides:

- `joinPremium` room subscription
- `premiumMessage` event handling
- real-time broadcast of premium chat messages

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd Gorzo
```

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with at least:

```env
MONGODB_URI=your-mongodb-connection-string
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

### Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in `frontend/` with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

Start the frontend dev server:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## Deployment

### Backend deployment

Use Vercel or another Node hosting provider. The backend entrypoint is:

- `backend/server.js`

If deploying on Vercel, set the build command to:

```bash
npm run vercel-build
```

and the start command to:

```bash
npm run vercel-start
```

Required environment variables:

- `MONGODB_URI`
- `GEMINI_API_KEY`
- `FRONTEND_URL`
- Optional: `FRONTEND_URLS`, `ALLOW_VERCEL_PREVIEW`

### Frontend deployment

Deploy the `frontend/` app as a static Next.js site. Required environment variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_WS_URL` (if WebSocket features are enabled)

---

## Environment Variables

### Backend

- `MONGODB_URI` — Connection string for MongoDB
- `GEMINI_API_KEY` — Gemini AI API key
- `FRONTEND_URL` — Allowed frontend origin
- `FRONTEND_URLS` — Optional comma-separated extra allowed origins
- `ALLOW_VERCEL_PREVIEW` — `true` to allow requests from Vercel preview domains

### Frontend

- `NEXT_PUBLIC_API_BASE_URL` — Backend API base URL
- `NEXT_PUBLIC_WS_URL` — Backend WebSocket URL

---

## License

This repository does not include a root `LICENSE` file. The backend package currently indicates an `ISC` license in `backend/package.json`.

If you want to apply a repository-wide license, add a `LICENSE` file at the root and update the README accordingly.

---

## Notes

- Ensure MongoDB is accessible before starting the backend.
- WebSocket support is configured for development and may require additional production hardening.
- Use the browser console and backend logs for debugging.
