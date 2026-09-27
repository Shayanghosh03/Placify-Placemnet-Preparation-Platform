# Placify API

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` and a long random `JWT_SECRET`.
3. For Google sign-in, create a Google OAuth web client and set:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - Add `http://localhost:5000/api/auth/google/callback` as an authorized redirect URI.
4. Start the API:

```bash
npm run dev
```

## Auth endpoints

- `POST /api/auth/register` - creates an account and sets an HttpOnly JWT cookie.
- `POST /api/auth/login` - validates credentials and sets an HttpOnly JWT cookie.
- `GET /api/auth/google` - starts Google OAuth.
- `GET /api/auth/me` - returns the authenticated user.
- `POST /api/auth/logout` - clears the JWT cookie.

The frontend sends requests with credentials enabled. Set `VITE_API_URL` to the API base URL when it is not `http://localhost:5000/api`.
