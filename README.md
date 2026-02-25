# Spikeball / Scramble

**Live:** [Youth Spikers League](https://youthspikersleague.com/)

A **full-stack Spikeball tournament management system** built with the MERN stack. It supports **real-time ranking, role-based access, and automated score updates**.

---

## 📂 Folder Structure

```
mern-spikeball-tournament/
│
├── apache/                       # Apache configuration files
├── auto_deploy.sh                 # Deployment script
├── client/                        # Frontend (React + Vite)
│   ├── public/                    # Static assets
│   ├── src/                       # React components, pages, utils
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── ...other config files
│
├── server/                        # Backend (Express + MongoDB)
│   ├── config/                    # Configuration files
│   ├── models/                    # MongoDB schemas
│   ├── routes/                    # API routes
│   ├── utils/                     # Helper functions
│   ├── app.js                     # Express app entry point
│   ├── pm2.ecosystem.json         # PM2 process config
│   └── ...other files
│
├── Players.csv                    # Sample player data
├── setup.sh                       # Initial setup script
└── spikeball-tournament.code-workspace
```

---

## ⚙️ Tech Stack

* **Frontend:** React.js, Vite
* **Backend:** Express.js, REST API
* **Database:** MongoDB
* **Authentication:** Session-based, role management

---

## 🚀 Features

* Session and **role-based authentication**
* Super admin can **create, update, delete staff accounts**
* Staff can manage events and player data
* CRUD operations for tournaments and matches
* **Real-time ranking and point updates**
* Undo functionality for rounds if scores were entered incorrectly

---

## 💻 Usage

### 1. Clone the repo

```bash
git clone https://github.com/your-username/mern-spikeball-tournament.git
cd mern-spikeball-tournament
```

### 2. Backend Setup

```bash
cd server

# Start MongoDB (Linux)
sudo systemctl start mongod

# Create a .env file in config folder if not existing (follow .env.example)
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install

# Update essential values in src/utils/global.ts
# Start development server
npm run dev
```

---

## 📝 Requirements & Notes

* Watch demo: [Loom Video](https://www.loom.com/share/008366a881eb491789055ac2bf89193a)
* **Rankings update immediately** after points are entered
* **Points update automatically**, no submit button required
* Players leaving should be marked and reflected in all subsequent rounds
* **Round logic:**

  * Rounds 3 & 4 require “1 up, 1 down” rotation while keeping middle players fixed
  * Undo round if points were entered incorrectly
* **Player access:** Players can enter their own points but cannot advance rounds or edit other data

---

## 🔹 Notes for Developers

* Frontend uses **React + TypeScript** with Vite
* Backend is **Express.js** with REST API endpoints
* MongoDB is used for real-time updates and flexible data modeling
* Deployment scripts and Apache configs are included for server setup

---

✅ **Key Takeaway:** This project is designed to manage a Spikeball tournament efficiently, with **automated score tracking, dynamic rankings, and flexible role-based access**.

---

