# UniEase – Bennett University Student Portal

A full-stack student portal with Login, Academic Portal, Food Order, Laundry, and Complaint pages.

---

## Tech Stack
- **Frontend**: React (Create React App)
- **Backend**: Node.js + Express
- **Database**: SQLite (auto-created on first run, no setup needed)

---

## How to Run

### Step 1 – Make sure Node.js is installed
Download from https://nodejs.org (choose LTS version)
Verify: `node --version` should show v18 or higher

---

### Step 2 – Start the Backend
Open a terminal and run:

```
cd uniease-project/backend
npm install
npm run dev
```

You should see:
```
✅  UniEase backend running on http://localhost:3001
📦  Database: uniease.db (auto-created)
```

---

### Step 3 – Start the Frontend
Open a SECOND terminal and run:

```
cd uniease-project/frontend
npm install
npm start
```

This will open http://localhost:3000 in your browser automatically.

---

## Login
Use any email + any password (4+ characters) to log in.
Example: s24cseu2266@bennett.edu.in / pass1234

---

## Pages
| Page | What it does |
|------|-------------|
| Login | Authenticate with email + password |
| Services | Home screen – choose a service |
| Academic Portal | Grades, attendance, timetable |
| Food Order | Browse menu, add to cart, place order |
| Laundry | Place & track laundry orders |
| Complaint | Submit & track complaints |

---

## API Endpoints
| Method | URL | Purpose |
|--------|-----|---------|
| POST | /api/login | Login or auto-register |
| POST | /order | Place laundry order |
| GET | /orders/laundry | Get laundry orders |
| POST | /api/food/order | Place food order |
| GET | /api/food/orders | Get food orders |
| POST | /api/complaint | Submit complaint |
| GET | /api/complaints | Get complaints |

---

## Troubleshooting

**npm not found** → Install Node.js from nodejs.org and restart terminal

**Port 3001 in use (Mac/Linux)**:
```
lsof -ti:3001 | xargs kill
```

**Port 3001 in use (Windows)**:
```
netstat -ano | findstr :3001
taskkill /PID <number> /F
```

**better-sqlite3 error on Windows**:
```
npm install better-sqlite3 --build-from-source
```
