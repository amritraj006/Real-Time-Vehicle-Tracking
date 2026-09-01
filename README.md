# 🚗 Real-Time Vehicle Tracking System

A full-stack, production-grade **Real-Time Vehicle Tracking & Fleet Management** platform built with modern web technologies. Track, monitor, and manage your entire vehicle fleet on an interactive **satellite map** with live telemetry, Socket.IO-powered updates, and a clean, responsive UI.

---

## 📸 Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing Page | Public |
| `/home` | Home / Marketing | Public |
| `/map` | Live Fleet Map View | 🔒 Authenticated |
| `/user-dashboard` | User Fleet Dashboard | 🔒 Authenticated |
| `/track/:vehicleId` | Single Vehicle Tracker | Public (shareable) |
| `/about` | About | Public |
| `/community` | Community | Public |

---

## ✨ Key Features

### 🗺️ Live Map (`/map`)
- **Satellite HD imagery** (Esri World Imagery) as the exclusive map layer
- Real-time animated vehicle markers with heading-aware icons
- Floating **Fleet Sidebar** with vehicle list & telemetry stats
- **TelemetryHUD** — floating bottom panel with Speed, Battery, Bearing, GPS Fix
- Layer controls, Fit-All, GPS Locate Me, and Fullscreen support
- Click any marker to select a vehicle and auto-follow mode

### 📊 User Dashboard (`/user-dashboard`)
- KPI statistics: Total Fleet, Active/Moving, Avg Speed, Battery health
- Vehicle management in **Grid** and **Table** views
- Real-time Socket.IO telemetry — live updates without page refresh
- Embedded **Satellite Live Mini-Map** with route polyline history trails
- Live **Telemetry Activity Stream** (terminal-style event log)
- Add/Delete vehicles with GPS coordinate presets
- Share tracking links to clipboard with one click

### 📍 Single Vehicle Tracker (`/track/:vehicleId`)
- Publicly shareable tracking link per vehicle
- Satellite map with route polyline animation
- Live speed, battery, heading, and GPS coordinates
- WhatsApp / Google Maps / Directions integration
- Auto-follow camera mode

### 🏠 Home & Landing
- Marketing homepage with feature highlights, testimonials, and CTA
- Animated hero section with live user count from context
- Clerk-powered auth flow integrated into navbar

### 🔐 Authentication
- **Clerk** authentication — sign in, sign up, user management
- Protected routes — `<ProtectedRoute>` wrapper for authenticated pages
- User profile avatar, email, and ID visible on dashboard

### ⚙️ Background Event Processing (Inngest)
- Listens to Clerk webhooks for user lifecycle events
- Automatically syncs user data from Clerk → MongoDB
- Handles async tasks reliably in the background

---

## 🧑‍💻 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 7 | Build tool & dev server |
| Tailwind CSS | v4 | Utility-first styling |
| React Router | v7 | Client-side routing |
| React Leaflet | Latest | Interactive satellite maps |
| Socket.IO Client | v4 | Live telemetry updates |
| Clerk React | Latest | Auth & user management |
| Lucide React | Latest | Icons |
| React Toastify | Latest | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | Latest LTS | Runtime |
| Express | v5 | HTTP server & REST API |
| Socket.IO | v4 | Real-time bidirectional events |
| Mongoose | v8 | MongoDB ODM |
| Inngest | v3 | Background event processing |
| Redis | v6 | Caching / session layer |
| Clerk SDK | Latest | Webhook verification & user sync |

### Database & Services
| Service | Purpose |
|---|---|
| **MongoDB Atlas** | Stores vehicles, users, route history |
| **Redis** | Caching and fast lookups |
| **Clerk** | Authentication & user management |
| **Inngest** | Background job queue & event handling |
| **Esri Satellite** | High-resolution map tiles |

---

## 📂 Project Structure

```
real-time-vehicle-tracker/
├── client/                      # React 19 + Vite Frontend
│   └── src/
│       ├── api/                 # Axios API wrappers (vehicleApi.js)
│       ├── components/
│       │   ├── common/          # ProtectedRoute, Loader, NotFound
│       │   ├── home/            # Hero, Features, CallToAction, etc.
│       │   └── map/             # FleetSidebar, TelemetryHUD, MapControls, AddVehicleForm
│       ├── constants/           # vehicleConfig.js (icons, gradients, colors)
│       ├── contexts/            # AppContext (Socket, user state)
│       ├── hooks/               # useAppContext
│       ├── pages/
│       │   ├── LandingPage.jsx  # / (root landing)
│       │   ├── Home.jsx         # /home (marketing)
│       │   ├── MapView.jsx      # /map (live fleet map)
│       │   ├── UserDashboard.jsx# /user-dashboard
│       │   ├── Lander.jsx       # /track/:vehicleId (sharable tracker)
│       │   ├── About.jsx
│       │   └── Community.jsx
│       └── utils/               # leafletSetup.js (markers, bearing calc)
│
├── server/                      # Node.js + Express Backend
│   ├── config/                  # DB and Redis connection setup
│   ├── controllers/             # Route controller logic
│   ├── inngest/                 # Inngest event handlers (Clerk sync)
│   ├── models/                  # Mongoose schemas (User, Vehicle)
│   ├── routes/                  # REST API routes
│   ├── services/                # Socket.IO real-time service
│   ├── app.js                   # Express app setup
│   └── server.js                # HTTP + Socket.IO server entry point
│
├── admin/                       # Admin dashboard (separate panel)
├── .gitignore
└── README.md
```

---

## ⚡ Installation & Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Clerk account (for auth)
- Inngest account (for background jobs)
- Redis instance (optional, for caching)

---

### 1. Clone the repository
```bash
git clone <repository_url>
cd real-time-vehicle-tracking
```

### 2. Install dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory (copy from `.env.example`):

```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# Server
PORT=5001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Inngest Background Jobs
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Redis (optional)
REDIS_URI=redis://localhost:6379
```

Create a `.env` file in the `client/` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BACKEND_URL=http://localhost:5001
```

---

### 4. Run the Project

**Start the backend server:**
```bash
cd server
npm run dev
# Runs at http://localhost:5001
```

**Start the frontend dev server:**
```bash
cd client
npm run dev
# Runs at http://localhost:5173
```

---

## 🌐 Live App URLs (Local)

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001/api |
| Socket.IO | ws://localhost:5001 |
| Inngest Dev Server | http://localhost:8288 |

---

## 📡 Real-Time Socket Events

| Event | Direction | Payload |
|---|---|---|
| `locationUpdate` | Server → Client | `{ vehicleId, name, type, userId, lat, lng, speed, heading, battery, route, updatedAt }` |
| `connect` | Client ← Server | Socket connection established |
| `disconnect` | Client ← Server | Socket connection closed |

---

## 🗺️ Map Configuration

All map views use **Esri World Imagery (Satellite HD)**:
```
https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
```

---

## 🔒 Environment Notes

- Never commit `.env` files. They are included in `.gitignore`.
- Clerk webhooks must be configured to point to `http://your-server/api/clerk/webhook` for user sync via Inngest to work.
- The Socket.IO server and REST API share the same port (`5001`).

---

## 📌 Project Status

🚀 **Active Development** — Core fleet tracking, auth, real-time telemetry, dashboard, and satellite map features are fully implemented. Admin panel is in progress.

---

## 📄 License

This project was developed as a college capstone project. All rights reserved.