# Team Task Manager

A simple collaborative task management app built with React, Node.js, and PostgreSQL. Nothing fancy — just a clean way for small teams to track who's doing what.

## What it does

- Create projects and invite teammates
- Create tasks with priority, due date, and assignee
- Kanban-style board with To Do / In Progress / Done columns
- Dashboard shows your task stats at a glance
- Admins manage members and tasks; members update their own

## Tech used

**Frontend:** React (Vite), Tailwind CSS v4, Axios, React Router DOM  
**Backend:** Node.js, Express, PostgreSQL (Neon), Drizzle ORM, JWT auth  
**Deploy:** Railway (both services)

---

## Running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm run db:push        # push schema to Neon
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:3000/api
npm run dev
```

---

## Setting up Neon DB

1. Go to [neon.tech](https://neon.tech) and create a free project
2. Copy the connection string from the dashboard
3. Paste it as `DATABASE_URL` in your backend `.env`
4. Run `npm run db:push` to create the tables

---

## Deploying to Railway

### Backend

1. Push code to GitHub
2. Create a new Railway project → Deploy from GitHub → select your repo
3. Set the root directory to `backend`
4. Add env vars: `DATABASE_URL`, `JWT_SECRET`, `PORT=3000`
5. Railway will auto-detect Node and deploy

### Frontend

1. Add a second service in the same Railway project
2. Set root directory to `frontend`
3. Add env var: `VITE_API_URL=https://your-backend-url.railway.app/api`
4. Railway builds with `npm run build` and serves the `dist` folder

---

## Folder structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js       # Neon + Drizzle connection
│   │   │   └── schema.js      # all tables defined here
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   └── taskController.js
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT verification
│   │   │   └── role.js        # admin/member checks
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   └── tasks.js
│   │   └── index.js           # Express app entry
│   ├── drizzle.config.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js       # Axios instance with token handling
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   └── Footer.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── ProjectPage.jsx
    │   ├── App.jsx            # routing
    │   └── main.jsx
    └── package.json
```

---

## API endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me

GET    /api/projects              # your projects
POST   /api/projects              # create project
GET    /api/projects/users        # all users (for member search)
GET    /api/projects/:id          # project + members
POST   /api/projects/:id/members  # add member (admin)
DELETE /api/projects/:id/members/:uid  # remove member (admin)

GET    /api/tasks/dashboard       # your task stats
GET    /api/tasks/:projectId      # project tasks
POST   /api/tasks/:projectId      # create task
PUT    /api/tasks/:pid/:tid       # update task
DELETE /api/tasks/:pid/:tid       # delete task (admin)
```

---

## Notes

- Token stored in localStorage, attached to all requests via Axios interceptor
- If token is expired or invalid, user gets redirected to login automatically
- Role is checked per project — someone can be admin on one project and member on another
- `drizzle-kit push` is used instead of migrations since this is a student project