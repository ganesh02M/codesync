# </> CodeSync — Real-Time Collaborative Code Editor

A real-time collaborative code editor where multiple users can write, edit, and execute code together — like Google Docs, but for code. Now with an integrated AI coding assistant.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ **Frontend** | [codesync-self.vercel.app](https://codesync-self.vercel.app) |
| ⚙️ **Backend** | [codesync-fvna.onrender.com](https://codesync-fvna.onrender.com) |

---

## ✨ Features

- 👥 **Real-time collaboration** — Multiple users can code together simultaneously
- 🤖 **AI Code Assistant** — Ask AI to explain, debug, or optimize your code (powered by Groq API)
- 💬 **Live Chat** — In-room chat sidebar for communication
- 🖱️ **Live Cursors** — See where other users are typing in real-time
- 🏠 **Room System** — Create or join rooms with unique Room ID
- 💻 **Monaco Editor** — VS Code's powerful editor in the browser
- ▶️ **Code Execution** — Run code directly in browser (JavaScript, Python, C, C++, Java, TypeScript)
- 💾 **Auto Save** — Save code state to database
- 🔐 **JWT Authentication** — Secure login and registration
- 📱 **Responsive UI** — Works on all devices

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Vite |
| **Editor** | Monaco Editor (@monaco-editor/react) |
| **Real-time** | Socket.io |
| **State Management** | Zustand |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT, bcrypt |
| **AI Assistant** | Groq API |
| **Code Execution** | Judge0 CE API |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 📂 Project Structure

```
codesync/
├── frontend/
│   ├── src/
│   │   ├── pages/          → Login, Register, Dashboard, Editor
│   │   ├── components/     → Reusable UI components
│   │   ├── context/        → SocketContext
│   │   ├── store/          → Zustand auth store
│   │   └── services/       → Axios API service
│   └── package.json
├── backend/
│   ├── controllers/        → Auth, Room, AI controllers
│   ├── models/             → User, Room models
│   ├── routes/             → Auth, Room, AI routes
│   ├── middleware/         → JWT auth middleware
│   ├── socket/             → Socket.io event handlers
│   ├── config/             → DB connection
│   └── index.js
└── README.md
```
 

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (Local or Atlas)
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone https://github.com/ganesh02M/codesync.git
cd codesync
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/codesync
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

```bash
npm run dev
```
✅ Backend runs on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
VITE_SERVER_URL=http://localhost:5000/api
```

```bash
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

---

## 📡 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| GET | `/logout` | Logout |
| GET | `/me` | Get current user |

### Room Routes (`/api/room`)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/create` | Create new room | ✅ |
| GET | `/my-rooms` | Get user's rooms | ✅ |
| GET | `/:roomId` | Get room details | ✅ |
| POST | `/join/:roomId` | Join a room | ✅ |
| POST | `/save/:roomId` | Save code | ✅ |
| POST | `/run` | Execute code | ✅ |

### AI Routes (`/api/ai`)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/suggest` | Get AI code suggestion/explanation | ✅ |

---

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Join a coding room |
| `code-change` | Client → Server | Broadcast code changes |
| `language-change` | Client → Server | Change language |
| `cursor-move` | Client → Server | Share cursor position |
| `chat-message` | Client → Server | Send chat message |
| `code-update` | Server → Client | Receive code changes |
| `cursor-update` | Server → Client | Receive cursor positions |
| `new-message` | Server → Client | Receive chat messages |
| `user-joined` | Server → Client | User joined notification |
| `user-left` | Server → Client | User left notification |

---

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repo on [render.com](https://render.com)
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Add environment variables in Render dashboard

### Frontend (Vercel)
1. Connect GitHub repo on [vercel.com](https://vercel.com)
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add `VITE_SERVER_URL` environment variable pointing to your backend URL + `/api`

---

## 👨‍💻 Author

**Ganesh Mishra**
- 📧 mishraganesh9305@gmail.com
- 🔗 [GitHub](https://github.com/ganesh02M)
- 💼 [LinkedIn](https://linkedin.com/in/ganesh-mishra-6baa9828b)
- 💻 [LeetCode](https://leetcode.com/u/Ganesh9305)