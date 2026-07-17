# QueueFlow

A modern full-stack application for managing clinic and OPD token queues. 

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS v4, Recharts
* **Backend:** Node.js, Express, MongoDB (Mongoose)

## Features
* **Manager Authentication:** JWT-based login/registration.
* **Queue Management:** Create queues and issue tokens sequentially.
* **Token Operations:** Reorder waiting tokens, call next token, cancel, or complete.
* **Analytics:** Real-time summary statistics and historical trend charts.
* **Public Display:** Full-screen "Now Serving" board with live clock.

## Setup Instructions



### 1. Frontend Setup
1. Open the `/client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev` (Runs on port 3000, proxies `/api` to port 5000)
4. Or build the production version: `npm run build`

## System Architecture

* **State Transitions:** Tokens move sequentially from `waiting` -> `in-service` -> `completed` (or `cancelled`).
* **Ordering:** Waiting tokens have an integer `position`. Reordering uses a quick O(1) position swap.
* **Analytics:** All analytics (wait times, throughput, etc.) are computed on-the-fly via MongoDB aggregation pipelines using `createdAt`, `calledAt`, and `completedAt` timestamps.
