# 🏮 SkillSwap

**Share what you know. Learn what you love.**

SkillSwap connects people who want to exchange skills. Add what you can teach and what you want to learn, discover potential partners, and start a conversation when you find a good match.

[**Try SkillSwap →**](https://skill-swap-sigma-nine.vercel.app)

---

## ✨ Features

- **Personal profiles** — share your bio, location, preferred mode, and the skills you offer and want to learn.
- **Smart matching** — discover people ranked by how well your skills and learning goals fit together. AI can recognize related skills; if the AI service is unavailable, the backend falls back to exact skill overlap.
- **Swap requests** — send a request, accept or reject an incoming request, cancel a pending request, and mark an accepted swap complete.
- **Messaging** — coordinate with your swap partner in a conversation that refreshes automatically while the page is visible.
- **Account security** — passwords are hashed, protected API routes use JSON Web Tokens, and the backend applies request validation and rate limiting.

## 🧭 How it works

1. **Create an account** and complete your profile.
2. **Add your skills** — choose what you can teach and what you would like to learn.
3. **Explore matches** and send a swap request to someone you'd like to connect with.
4. **Connect and chat** once a request is accepted, then mark the swap complete when you're done.

Matching requires at least one skill you want to learn. To see meaningful results in a local installation, create another account with relevant skills.

## 🛠️ Tech stack

| Part | Technologies |
| --- | --- |
| Frontend | React, React Router, Vite, CSS |
| Backend | Node.js, Express, Mongoose, JWT, Zod |
| Database | MongoDB |
| Matching service | Python, FastAPI, Groq API |

The Express API stores application data in MongoDB and requests candidate scores from the Python service. The matching service considers up to 20 candidates and caches identical requests for 10 minutes. If the service fails or times out, the backend uses its basic matching algorithm instead.

## 🚀 Run locally

### Prerequisites

- Node.js and npm (use a version compatible with the project's Vite and dependencies)
- Python and pip
- A running MongoDB instance or MongoDB Atlas connection string
- A Groq API key for AI-powered matching (optional if you only want basic matching)

### 1. Clone the repository

```bash
git clone https://github.com/ananya-apricot/skill_swap.git
cd skill_swap
```

### 2. Set up the backend

In a terminal:

```bash
cd backend
npm install
cp .env.example .env
```

On Windows Command Prompt, use `copy .env.example .env` instead of `cp`.

Edit `backend/.env`:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/skillswap
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_KEY=replace_with_a_shared_secret
```

Use your Atlas connection string instead if applicable. `CLIENT_URL` must match the frontend's origin. Keep secrets private and never commit your `.env` files.

Seed the skill catalogue and start the API:

```bash
npm run seed
npm run dev
```

The seed command adds or updates the starter skills, so it can be run again. The backend starts after connecting to MongoDB. Check it at [http://localhost:5000/api/health](http://localhost:5000/api/health).

### 3. Set up the frontend

Open a second terminal:

```bash
cd skill_swap/frontend
npm install
```

Create `frontend/.env` with:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

The `/api` suffix is required because the frontend appends paths such as `/auth` and `/matches` to this value.

```bash
npm run dev
```

Open the address printed by Vite, normally [http://localhost:5173](http://localhost:5173). If Vite uses a different port, update `CLIENT_URL` in the backend and restart it.

### 4. Set up AI matching (optional)

Open a third terminal. From the repository root:

```bash
cd ai-service
python -m venv .venv
```

Activate the virtual environment:

```bash
# macOS / Linux
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
```

Then install the dependencies and create your environment file:

```bash
pip install -r requirements.txt
cp .env.example .env
```

On Windows Command Prompt, use `copy .env.example .env`. Set the following in `ai-service/.env`:

```dotenv
AI_SERVICE_KEY=replace_with_the_same_shared_secret
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

The `AI_SERVICE_KEY` must match the value in `backend/.env`. Start the service:

```bash
uvicorn main:app --reload --port 8000
```

Without this service, matching still works using exact skill overlap. The first AI request may take longer while the service starts.

## 📁 Project structure

```text
skill_swap/
├── frontend/       # React interface and Vite configuration
├── backend/        # Express API, database models, routes, and skill seed
└── ai-service/     # FastAPI candidate scoring service
```

## 🔧 Useful commands

Run each command from its corresponding directory.

| Directory | Command | Purpose |
| --- | --- | --- |
| `frontend` | `npm run dev` | Start the frontend development server |
| `frontend` | `npm run build` | Build the frontend for production |
| `frontend` | `npm run lint` | Run ESLint |
| `backend` | `npm run dev` | Start the API with automatic restarts |
| `backend` | `npm start` | Start the API |
| `backend` | `npm run seed` | Add or update starter skills |
| `ai-service` | `uvicorn main:app --reload --port 8000` | Start the matching service |

## 🩺 Troubleshooting

- **The backend won't start:** check that MongoDB is running or that the Atlas URI and network access are configured correctly.
- **The frontend can't reach the API:** check `VITE_API_URL`, including the `/api` suffix, and make sure `CLIENT_URL` matches the frontend origin. Restart the relevant development server after changing environment variables.
- **No matches appear:** add at least one wanted skill, and make sure another user has offered a relevant skill. Basic matching only recognizes exact overlaps.
- **AI matches aren't available:** check the Groq key, the AI service URL, and that both services use the same shared key. The backend falls back to basic matching when the service is unavailable.

## 🤝 Contributing

Ideas and improvements are welcome. Open an issue to discuss a change, or fork the repository, make your changes on a branch, and open a pull request describing what you changed and how you tested it.

---

Made with curiosity and a love for learning. 🏮
