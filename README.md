# QueueFlow Clinic Manager

QueueFlow is a modern, real-time, full-stack application designed to seamlessly manage clinic and OPD token queues. It features dynamic TV displays, real-time sync across all devices, multi-lingual voice announcements, and mobile tracking for patients.

## 🚀 Key Features

* **Real-time Sync (WebSockets):** Instant UI updates across the entire system. When a doctor calls a patient, all TV displays and patient mobile phones update instantly via `socket.io` without requiring page refreshes.
* **Smart TV Displays:** 
  * **Global Display:** A unified TV screen showing the current serving status for multiple doctors/queues simultaneously.
  * **Individual Display:** A dedicated full-screen "Now Serving" board for a single doctor/room.
  * **Responsive & Robust:** Fully responsive CSS built with `vh` bounds to ensure text perfectly scales and never truncates, no matter the TV or monitor dimensions.
* **Multi-lingual Voice Announcements (TTS):** Automated Text-To-Speech calls out the patient's name and token number in English, Hindi, and Telugu dynamically.
* **Mobile Patient Tracking:** A built-in QR Code system allows patients to scan the TV display with their smartphone and track their live queue status from anywhere.
* **Advanced Queue Management:** Create queues, issue tokens sequentially, reorder waiting tokens with O(1) swapping, and mark them as complete or cancelled.
* **Analytics Dashboard:** Real-time summary statistics and historical trend charts via MongoDB aggregation pipelines (wait times, throughput, etc.).
* **Authentication:** Secure JWT-based login/registration for clinic managers.

## 💻 Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, Recharts, React Router v6
* **Backend:** Node.js, Express, Socket.io
* **Database:** MongoDB (Mongoose) with MongoDB Atlas
* **Deployment:** 
  * Frontend: Vercel
  * Backend: Render

## ⚙️ Local Setup Instructions

### 1. Database Setup
1. Create a free MongoDB database on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get your connection string (URI).

### 2. Backend Setup
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `/server` directory and add:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the backend server: `npm run dev` (Runs on port 5000)

### 3. Frontend Setup
1. Open a new terminal and navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `/client` directory and add:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the Vite dev server: `npm run dev` (Runs on port 3000)

## 🌐 Deployment Architecture & Troubleshooting

QueueFlow is designed for modern cloud deployment. 

### Backend (Render)
* The Node.js backend is deployed on Render as a Web Service.
* **Important:** Do NOT hardcode the `PORT` environment variable in the Render dashboard. Render assigns dynamic ports automatically for routing.

### Frontend (Vercel)
* The React frontend is deployed on Vercel.
* **Environment Variables:** Make sure `VITE_API_URL` is set to the Render backend URL (e.g., `https://queueflow-backend.onrender.com`) and applied to the **Production** environment. 
* **SPA Routing Fix:** Vercel requires a `vercel.json` rewrite file in the `/client` directory to support React Router. This prevents `404 Not Found` errors when patients scan the QR code and land on a direct route like `/status/:id`.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🏗️ System Architecture Highlights
* **State Transitions:** Tokens move sequentially from `waiting` -> `in-service` -> `completed` (or `cancelled`).
* **Ordering:** Waiting tokens have an integer `position`. Reordering uses a quick O(1) position swap.
* **CORS & Sockets:** The Express backend is configured to accept Cross-Origin Resource Sharing (CORS) from the Vercel frontend, specifically enabling WebSockets (polling and websocket transports) to ensure zero-latency communication.
