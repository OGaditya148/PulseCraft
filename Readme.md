PulseCraft:
-------------------

PulseCraft is a modern, full-stack project management and task tracking application designed to help teams and developers organize, monitor, and streamline their daily deliverables.

Features:
--------------
* Interactive Dashboard: Real-time overview of active tasks, statuses, and project metrics.

* Task Management: Create, view, and organize deliverables with dynamic sorting and status tracking.

* Robust Backend API: Secure Express.js server integrated with Prisma ORM and PostgreSQL.

* Modern UI Design: Clean and responsive user interface styled with Tailwind CSS.

Tech Stack:
----------------------------
* Frontend: React, Vite, Tailwind CSS, TypeScript

* Backend: Node.js, Express, TypeScript

* Database & ORM: PostgreSQL, Prisma ORM

Getting Started
--------------
Prerequisites:
Ensure you have the following installed on your local machine:
----------------------------------------------------------------------
Node.js (v18+ recommended)
PostgreSQL database instance

Installation & Local Setup:
----------------------------------
Clone the repository:
Bash
* git clone https://github.com/OGaditya148/PulseCraft.git
* cd PulseCraft

Setup the Backend:
----------------------------
Bash
* cd backend
* npm install
* Create a .env file inside the backend directory and add your PostgreSQL connection string:

Code snippet:
------------------
* DATABASE_URL="postgresql://user:password@localhost:5432/pulsecraft?schema=public"
* PORT=5000
* Run database migrations and start the server:

Bash
* npx prisma migrate dev
* npm run dev
* Setup the Frontend:
* Open a separate terminal window and navigate to the frontend directory:
Bash
cd frontend
npm install
npm run dev

Deployment:
------------
Configured for seamless deployment on platforms like Vercel utilizing monorepo service routing via vercel.json.
