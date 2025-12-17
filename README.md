🚗 Real-Time Vehicle Tracker

A web-based Real-Time Vehicle Tracking System developed as a college project.
Tracks, monitors, and visualizes vehicle activity on an interactive map using real-time data.

Focuses on real-time communication, authentication, and background event handling with modern full-stack technologies.

📌 Project Status

🚧 Currently in Development
Core tracking and admin features are implemented. More enhancements are planned.

🎯 Features
👤 User Features

Secure login & signup via Clerk Authentication

Add and manage vehicles

View real-time vehicle location updates

Vehicle movement status (active/inactive)

Speed and activity indicators

🛠️ Admin Dashboard

Admin-only access

Monitor all users and vehicles

Live vehicle tracking on interactive map

View active and inactive vehicles

Platform statistics and analytics

🗺️ Real-Time Tracking

Interactive map using Leaflet.js

Live vehicle updates using Socket.IO

Smooth marker updates and status changes in real time

🔐 Authentication & User Management

Authentication via Clerk

User data fetched securely from Clerk

Stores user and vehicle info in MongoDB

Inngest handles background tasks and syncs Clerk user data to MongoDB

⚙️ Event Handling (Inngest)

Listens to Clerk webhooks/events

Automatically updates MongoDB with user changes

Handles background tasks asynchronously and reliably

🧑‍💻 Tech Stack
Frontend

React.js

Tailwind CSS

Leaflet.js

Socket.IO Client

Backend

Node.js

Express.js

Socket.IO

Inngest

Database

MongoDB (Mongoose)

Authentication

Clerk

📂 Project Structure
real-time-vehicle-tracker/
├── client/          # React frontend
├── server/          # Node.js backend
│   ├── routes/      # API routes
│   ├── models/      # MongoDB schemas
│   ├── inngest/     # Inngest event handlers
│   ├── sockets/     # Real-time socket logic
│   └── server.js
├── .env
└── README.md

⚡ Installation & Setup
1. Clone the repository
git clone <repository_url>
cd real-time-vehicle-tracker

2. Install dependencies

Backend:

cd server
npm install


Frontend:

cd ../client
npm install

3. Configure Environment Variables

Create a .env file inside the server/ folder with the following:

MONGO_URI=your_mongo_url
PORT=3000
CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
INNGEST_EVENT_KEY=your_event_key
INNGEST_SIGNING_KEY=your_signing_key

4. Run the Project

Start backend:

cd server
npm run dev


Start frontend:

cd ../client
npm run dev


The app should now be running at http://localhost:5173 (default Vite port) and the backend at http://localhost:3000.