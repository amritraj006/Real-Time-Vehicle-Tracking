<<<<<<< HEAD
# 🚗 Real-Time Vehicle Tracker

A web-based **Real-Time Vehicle Tracking System** developed as a **college project**, designed to track, monitor, and visualize vehicle activity on an interactive map using real-time data.

The project focuses on **real-time communication, authentication, and background event handling** using modern full-stack technologies.

---

## 📌 Project Status
🚧 **Currently in Development**  
Core tracking and admin features are implemented. More enhancements are planned.

---

## 🎯 Features

### 👤 User Features
- Secure login & signup using **Clerk Authentication**
- Add and manage vehicles
- View vehicle location updates in real time
- Vehicle movement status (active / inactive)
- Speed and activity indicators

### 🛠️ Admin Dashboard
- Admin-only access
- Monitor all users and vehicles
- Live vehicle tracking on map
- View active and inactive vehicles
- Platform statistics and analytics

---

## 🗺️ Real-Time Tracking
- Interactive map powered by **Leaflet**
- Live vehicle location updates using **Socket.IO**
- Smooth marker updates and real-time status changes

---

## 🔐 Authentication & User Management
- Authentication handled using **Clerk**
- User data is fetched from Clerk
- User information is securely stored in **MongoDB**
- **Inngest** is used to handle background events and sync Clerk user data into the database

---

## ⚙️ Event Handling (Inngest)
- Listens to Clerk webhooks/events
- Automatically stores and updates user data in MongoDB
- Ensures database stays in sync with authentication provider
- Handles background tasks asynchronously and reliably

---

## 🧑‍💻 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Leaflet.js
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- Inngest

### Database
- MongoDB (Mongoose)

### Authentication
- Clerk

---

## 📂 Project Structure
real-time-vehicle-tracker/
├── client/ # React frontend
├── server/ # Node.js backend
│ ├── routes/ # API routes
│ ├── models/ # MongoDB schemas
│ ├── inngest/ # Inngest event handlers
│ ├── sockets/ # Real-time socket logic
│ └── server.js
├── .env
└── README.md

1. Install dependencies

cd server
npm install

cd ../client
npm install

2. Environment Variable
   
server
MONGO_URI=your_mongo_url
PORT=3000
CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
INNGEST_EVENT_KEY=your_event_key
INNGEST_SIGNING_KEY=your_signing_key

3. Run the Project

# Start backend
cd server
npm i
touch .env
npm run dev

# Start frontend
cd client
npm i
npm run dev
=======
>>>>>>> 4d6d8bb6f84e8d830b1e129cf3669b29c2735635

