# QueueLess

QueueLess is a full-stack queue management application designed to help users join, track, and manage queues digitally.

The project consists of a **React + Vite frontend** and an **Express + Prisma backend**.

---

## 📁 Project Structure

```text
QueueLess/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# 🚀 Getting Started

Follow the steps below to run QueueLess on your local system after cloning the repository.

## 1. Prerequisites

Make sure the following are installed:

* **Node.js** (LTS recommended)
* **npm**
* **Git**
* A database supported by your Prisma configuration
* A code editor such as VS Code

Check Node.js and npm:

```bash
node -v
npm -v
```

Check Git:

```bash
git --version
```

---

# 2. Clone the Repository

Run this command from the location where you want to store the project:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Then enter the project directory:

```bash
cd QueueLess
```

---

# 3. Backend Setup

Open a terminal in the project root and move to the backend:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

---

## 3.1 Backend Environment Variables

Create a `.env` file inside the `backend` folder:

```text
QueueLess/
└── backend/
    ├── .env
    ├── package.json
    ├── prisma/
    └── src/
```

Example:

```env
DATABASE_URL="your_database_connection_string"

PORT=5000

JWT_SECRET="your_jwt_secret"

FRONTEND_URL="http://localhost:5173"

# Add other environment variables required by your application
```

> Do not commit `.env` to GitHub.

Make sure `.gitignore` contains:

```gitignore
.env
node_modules/
```

---

# 4. Prisma Setup

All Prisma commands should be executed from the **backend directory**.

Current path:

```text
QueueLess/backend
```

Generate the Prisma Client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

If Prisma asks for a migration name, enter an appropriate name, for example:

```text
initial_setup
```

You can also run:

```bash
npx prisma migrate dev
```

---

## 4.1 Seed the Database

If the project contains initial/demo data in:

```text
backend/prisma/seed.js
```

run:

```bash
npm run prisma:seed
```

---

# 5. Start the Backend

For development:

```bash
npm run dev
```

The backend will start using:

```text
src/server.js
```

The default URL is expected to be:

```text
http://localhost:5000
```

depending on the `PORT` configured in `.env`.

For production-style execution:

```bash
npm start
```

---

# 6. Frontend Setup

Open a **new terminal**.

From the project root:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

---

## 6.1 Frontend Environment Variables

If the frontend uses environment variables, create:

```text
frontend/.env
```

For example:

```env
VITE_API_URL=http://localhost:5000
```

Use the exact variable names expected by the frontend source code.

> Vite exposes frontend environment variables only when they start with `VITE_`.

---

# 7. Start the Frontend

From:

```text
QueueLess/frontend
```

run:

```bash
npm run dev
```

Vite will normally start the frontend at:

```text
http://localhost:5173
```

Open the URL shown in the terminal.

---

# 🏃 Run the Complete Project

You need **two terminals**.

## Terminal 1 — Backend

```bash
cd QueueLess/backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Terminal 2 — Frontend

```bash
cd QueueLess/frontend
npm install
npm run dev
```

The application should then be available at:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:5000
```

---

# 📦 Backend Commands

All commands below should be executed from:

```text
QueueLess/backend
```

### Install dependencies

```bash
npm install
```

### Start backend

```bash
npm start
```

### Start backend in development mode

```bash
npm run dev
```

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Create/run Prisma migration

```bash
npm run prisma:migrate
```

### Seed database

```bash
npm run prisma:seed
```

### Prisma Studio

You can also open Prisma Studio to inspect the database:

```bash
npx prisma studio
```

---

# 🎨 Frontend Commands

All commands below should be executed from:

```text
QueueLess/frontend
```

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Create production build

```bash
npm run build
```

### Preview production build locally

```bash
npm run preview
```

---

# 🗄️ Database Setup

QueueLess uses **Prisma ORM** for database access.

The Prisma schema is located at:

```text
backend/prisma/schema.prisma
```

After configuring `DATABASE_URL` in:

```text
backend/.env
```

run:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

If seed data is available:

```bash
npm run prisma:seed
```

---

# 🔄 Development Workflow

After cloning the repository for the first time:

```text
Clone Repository
       ↓
Install Backend Dependencies
       ↓
Configure backend/.env
       ↓
Generate Prisma Client
       ↓
Run Database Migration
       ↓
Seed Database
       ↓
Start Backend
       ↓
Install Frontend Dependencies
       ↓
Configure frontend/.env
       ↓
Start Frontend
       ↓
Open Application
```

---

# 🛠️ Recommended First-Time Setup

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

---

# 🏗️ Production Build

## Frontend

From:

```text
QueueLess/frontend
```

run:

```bash
npm install
npm run build
```

The production files will be generated in:

```text
frontend/dist/
```

To preview the production build locally:

```bash
npm run preview
```

---

## Backend

From:

```text
QueueLess/backend
```

install dependencies:

```bash
npm install
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

Start the server:

```bash
npm start
```

For actual production deployment, configure the required environment variables and database on your hosting platform.

---

# 🔌 Tech Stack

## Frontend

* React
* Vite
* React Router
* TanStack React Query
* Axios
* Zustand
* React Hook Form
* Zod
* Recharts
* Socket.IO Client
* HTML5 QR Code
* QRCode
* Tailwind CSS

## Backend

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL/MySQL/Database configured in Prisma
* Socket.IO
* JWT
* bcrypt
* Nodemailer
* Zod
* Helmet
* CORS
* Pino
* Node Cron
* Swagger

---

# 📜 Available NPM Scripts

## Backend

Defined in `backend/package.json`:

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `npm start`               | Starts the backend server                     |
| `npm run dev`             | Starts backend using Nodemon                  |
| `npm run prisma:generate` | Generates Prisma Client                       |
| `npm run prisma:migrate`  | Creates/applies Prisma development migrations |
| `npm run prisma:seed`     | Seeds the database                            |

## Frontend

Defined in `frontend/package.json`:

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Starts Vite development server |
| `npm run build`   | Creates production build       |
| `npm run preview` | Previews production build      |

---

# 🧹 Clean Installation

If dependencies are corrupted or `node_modules` causes problems, delete `node_modules` and reinstall.

### Backend

```bash
cd backend
rm -rf node_modules
npm install
```

### Windows PowerShell

```powershell
cd backend
Remove-Item -Recurse -Force node_modules
npm install
```

### Frontend

```bash
cd frontend
rm -rf node_modules
npm install
```

### Windows PowerShell

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

---

# ⚠️ Common Issues

## 1. `npm` is not recognized

Install Node.js and restart your terminal.

Check:

```bash
node -v
npm -v
```

---

## 2. Prisma Client Error

Run:

```bash
cd backend
npm run prisma:generate
```

Then restart the backend:

```bash
npm run dev
```

---

## 3. Database Connection Error

Check:

```text
backend/.env
```

and make sure:

```env
DATABASE_URL="your_database_connection_string"
```

is correct.

Then run:

```bash
cd backend
npm run prisma:migrate
```

---

## 4. Frontend Cannot Connect to Backend

Check the frontend API URL in:

```text
frontend/.env
```

For local development, it may look like:

```env
VITE_API_URL=http://localhost:5000
```

Also make sure the backend is running:

```bash
cd backend
npm run dev
```

---

## 5. Port Already in Use

If port `5000` is already being used, change the backend port in:

```text
backend/.env
```

Example:

```env
PORT=5001
```

Then update the frontend API URL accordingly:

```env
VITE_API_URL=http://localhost:5001
```

---

# 🔐 Environment Variables

Never commit sensitive values such as:

* Database credentials
* JWT secrets
* Email passwords
* API keys
* SMTP credentials
* Private tokens

Keep them inside `.env` files.

Example:

```text
QueueLess/
│
├── frontend/
│   ├── .env
│   └── ...
│
├── backend/
│   ├── .env
│   └── ...
│
└── README.md
```

---

# 📌 Important Notes

1. Run backend commands from the `backend` directory.
2. Run frontend commands from the `frontend` directory.
3. Configure environment variables before starting the application.
4. Configure the database before running Prisma migrations.
5. Run `npm run prisma:generate` after installing backend dependencies.
6. Do not upload `.env` files to GitHub.
7. Run the backend and frontend simultaneously during development.

---

# 👨‍💻 Development

### Backend terminal

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend terminal

```bash
cd frontend
npm install
npm run dev
```

---

# 📄 License

Add your project license information here.

---

# 🙌 Contributing

Contributions, issues, and feature requests are welcome.

If you want to contribute:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd QueueLess
```

Set up the backend and frontend using the instructions above, create a new branch, make your changes, and submit a pull request.
