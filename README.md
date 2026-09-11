# TeleMedicine Fullstack Platform

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS + Socket.io-client + Stripe React
- **Backend:** Node.js + Express + MongoDB + Mongoose + Socket.io + JWT + Stripe + Cloudinary

---

## Quick Start (Terminal Commands)

### 1. Clone/Extract the project
```bash
cd telemedicine-fullstack
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/telemedicine
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional — the demo flow uses the built-in mock Naira gateway
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

CLIENT_URL=http://localhost:5173
```

Start MongoDB (in a separate terminal):
```bash
mongod
```

Run the backend:
```bash
node --watch server.js
# Server runs on http://localhost:5001
```

### 3. Frontend Setup (new terminal)
```bash
cd frontend
npm install
```

Run the frontend:
```bash
npm run dev
# App runs on http://localhost:5173
```

### 4. Optional — Stripe Webhook (only if re-enabling real Stripe payments)
```bash
stripe login
stripe listen --forward-to localhost:5001/api/payments/webhook
```

> The demo booking flow uses the built-in mock Naira gateway (`POST /api/payments/mock-pay`)
> so no Stripe account or webhook is required to try the full patient → doctor journey.

---

## Project Structure

```
telemedicine-fullstack/
├── backend/
│   ├── config/          # DB, Cloudinary, Stripe configs
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, upload, error handler
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── uploads/         # File uploads
│   ├── .env.example
│   ├── package.json
│   └── server.js        # Express + Socket.io entry
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # Auth context
    │   ├── pages/       # All pages
    │   ├── App.jsx      # Router setup
    │   └── main.jsx     # Entry point
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Features

| Feature | Description |
|---------|-------------|
| Patient/Doctor/Admin Accounts | JWT-based auth with role separation |
| Doctor Verification | Upload documents, admin review workflow |
| Doctor Profiles | Search, filter, ratings, reviews |
| Appointment Booking | Select date/time, book with payment |
| Availability Calendar | Weekly recurring slots management |
| Video Consultation | WebRTC via SimplePeer + Socket.io |
| Live Chat | Real-time messaging during appointments |
| Electronic Prescriptions | Create/view prescriptions with medications |
| Medical Records | CRUD health records with tags |
| Stripe Payments | PaymentIntent checkout + webhooks |
| Admin Dashboard | Stats, verify doctors, view all data |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/auth/me` | Private | Current user |
| GET | `/api/doctors` | Public | List doctors |
| GET | `/api/doctors/:id` | Public | Doctor detail |
| POST | `/api/appointments` | Patient | Book appointment |
| GET | `/api/appointments` | Private | List appointments |
| POST | `/api/prescriptions` | Doctor | Create prescription |
| POST | `/api/payments/create-intent` | Private | Stripe payment |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| PUT | `/api/admin/doctors/:id/verify` | Admin | Verify doctor |

---

## Default Ports
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173`
- MongoDB: `mongodb://localhost:27017`

---

## Troubleshooting

**MongoDB not starting?**
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
net start MongoDB
```

**CORS errors?** Check `CLIENT_URL` in backend `.env` matches your frontend URL.

**Stripe webhook failing?** Use the Stripe CLI to forward webhooks locally.
