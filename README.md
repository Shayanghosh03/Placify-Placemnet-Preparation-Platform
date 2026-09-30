# Placify

Placify is a placement-preparation platform that helps students practice aptitude, reasoning, verbal ability, and DSA topics in one dashboard.

The application includes authentication, progress tracking, daily goals, curated practice questions, notes, mock tests, bookmarks, and a roadmap for consistent interview preparation.

## Features

- Email/password authentication with secure HttpOnly JWT cookies
- Optional Google OAuth sign-in
- Dashboard overview with:
  - Overall completion progress
  - Subject-wise progress
  - Continue Learning recommendations
  - Daily goals
  - Study streak and activity information
- Practice workspaces for:
  - Aptitude
  - Reasoning
  - Verbal Ability
- DSA roadmap with topic cards for arrays, strings, hashing, linked lists, stacks, queues, trees, graphs, dynamic programming, and more
- Topic-specific question pages with problem and solution links
- Notes library with bookmarks
- Mock placement tests
- Learning roadmap and progress analytics
- Responsive dashboard layout with a fixed, scroll-independent sidebar

## Tech Stack

### Frontend

- React
- Vite
- JavaScript/JSX
- Lucide React icons
- Oxlint

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Passport Google OAuth
- Helmet
- CORS
- Express rate limiting

## Project Structure

```text
Placify/
├── backend/
│   ├── src/
│   │   ├── config/       # Environment and database configuration
│   │   ├── middleware/   # Authentication middleware
│   │   ├── models/       # User, progress, and content schemas
│   │   ├── routes/       # Authentication and progress APIs
│   │   ├── scripts/      # Content seed script
│   │   └── server.js     # Express application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Shared UI components
│   │   ├── hooks/        # Dashboard data hooks
│   │   ├── App.jsx       # Main application and dashboard views
│   │   └── api.js        # API client
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB database, local or hosted through MongoDB Atlas
- Optional: Google OAuth web application credentials

## Installation

Clone the repository and install dependencies for both applications:

```bash
git clone https://github.com/Shayanghosh03/Placify-Placemnet-Preparation_Platform.git
cd Placify

cd backend
npm install

cd ../frontend
npm install
```

## Environment Configuration

Create `backend/.env` with the following values:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/placify
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Optional Google OAuth configuration
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Never commit `.env` files or expose `JWT_SECRET`, database credentials, or OAuth client secrets.

If Google sign-in is enabled, add this callback URL to the Google OAuth application's authorized redirect URIs:

```text
http://localhost:5000/api/auth/google/callback
```

The frontend defaults to:

```text
http://localhost:5000/api
```

To use another API URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Seed Content

The backend includes a seed script for aptitude, reasoning, verbal ability, DSA, notes, and mock-test content:

```bash
cd backend
npm run seed
```

Run this after configuring `MONGODB_URI`. The script uses upserts, so it can safely be run again to update the predefined content.

## Running Locally

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

The API starts at:

```text
http://localhost:5000
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The Vite development server is usually available at:

```text
http://localhost:5173
```

## Production Commands

Build the frontend:

```bash
cd frontend
npm run build
```

Preview the production frontend build:

```bash
npm run preview
```

Start the backend without file watching:

```bash
cd backend
npm start
```

## API Overview

### Health

```text
GET /api/health
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/google
POST /api/auth/logout
```

### Progress

Progress routes require authentication:

```text
GET   /api/progress
GET   /api/progress/content
POST  /api/progress/topic/:topicId/solve
POST  /api/progress/quiz
PATCH /api/progress/goals/:index
POST  /api/progress/bookmarks
```

The frontend sends requests with credentials enabled so the authentication cookie is included automatically.

## Quality Checks

Run the frontend linter:

```bash
cd frontend
npm run lint
```

Run the frontend production build:

```bash
cd frontend
npm run build
```

## Security Notes

- Keep environment files private.
- Use a long, unpredictable JWT secret in every deployed environment.
- Configure `CLIENT_URL` to the exact frontend origin in production.
- Use HTTPS in production so authentication cookies and user data are protected in transit.
- Restrict Google OAuth redirect URIs to trusted application URLs.

## License

This project does not currently declare a public open-source license.
