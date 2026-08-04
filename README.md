# NoteVault

A secure, role-based Notes API built with Node.js, Express, and MongoDB. NoteVault implements a complete JWT-based authentication system with access/refresh token rotation, role-based authorization, and fully ownership-scoped CRUD operations for notes.

**Live API:** [https://notevault-fec8.onrender.com](https://notevault-fec8.onrender.com)
> Hosted on Render's free tier — the first request after a period of inactivity may take 30–60 seconds while the service spins back up.

This project was built as a hands-on learning exercise to understand authentication, middleware, and REST API design from first principles — every route, validation rule, and security check was designed and implemented manually rather than copied from a boilerplate.

## Features

### Authentication
- User signup with `argon2` password hashing
- Login issuing a short-lived **access token** and a long-lived **refresh token**, signed with separate secrets
- Refresh token rotation with persistence in MongoDB (`RefreshToken` collection), enabling multi-device sessions
- Logout that revokes the refresh token server-side
- Account deletion with password re-confirmation and cascading cleanup of the user's notes and sessions

### Authorization
- `authMiddleware` — verifies the access token (sent via `Authorization: Bearer <token>`) and attaches the authenticated user's id and role to the request
- `requireRole` — a configurable, reusable middleware (built using the higher-order function/closure pattern) for restricting routes to specific roles (e.g. `admin`)

### Notes (CRUD)
- Create, read, update, and delete notes
- All note operations are scoped to the authenticated user at the **database query level** — a user can never read, edit, or delete another user's notes, even by guessing an id
- Fetching a note that exists but belongs to another user returns `404`, not `403`, to avoid leaking the existence of other users' data

### Admin
- List all users, with optional filtering by account creation date (`/users?from=&to=`)
- View any specific user's notes
- Role-restricted via `requireRole(['admin'])`

### Security practices implemented
- Passwords hashed with `argon2`, never stored or returned in plain text
- Access and refresh tokens signed with **separate secrets**, limiting the blast radius of a leaked secret
- Refresh tokens stored server-side to allow real revocation (logout invalidates the session immediately, not just on the client)
- Refresh tokens delivered via `httpOnly`, `sameSite=None` cookies (with `secure` enabled in production) to reduce exposure to XSS
- Input validation on all write operations using `joi`
- MongoDB `ObjectId` validation on all route parameters before querying

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password hashing | `argon2` |
| Validation | `joi` |
| Cookies | `cookie-parser` |
| Environment config | `dotenv` |
| Testing | Jest, Supertest, mongodb-memory-server |
| Hosting | Render (API), MongoDB Atlas (database) |

## Project Structure

```
NoteVault/
├── config/
│   └── dbConn.js           # MongoDB connection setup
├── controllers/
│   ├── authController.js   # signup, login, refresh, logout, account deletion
│   ├── notesController.js  # notes CRUD + admin note lookups
│   └── userController.js   # admin user listing/filtering
├── middleware/
│   ├── authMiddleware.js   # access token verification
│   └── requireRole.js      # role-based route protection
├── models/
│   ├── User.js
│   ├── RefreshToken.js
│   └── Note.js
├── routes/
│   ├── authRoutes.js
│   ├── notesRoutes.js
│   └── userRoutes.js
├── validators/
│   ├── authValidator.js
│   └── noteValidator.js
├── tests/
│   ├── setup/
│   │   ├── dbHandler.js     # connect/clear/close an in-memory test database
│   │   └── testHelpers.js   # shared test helpers (e.g. signup + login a test user)
│   ├── auth.test.js
│   └── notes.test.js
├── app.js                   # builds the Express app (middleware + routes)
├── index.js                 # entry point — loads env, connects DB, starts the server
├── .env.example              # template for required environment variables
└── package.json
```

> `app.js` and `index.js` are deliberately separate: `app.js` only builds the Express app and is what test files import, while `index.js` handles environment setup, the database connection, and starting the actual server. This keeps tests from needing a live database connection or an open port.

## Getting Started

### Prerequisites
- Node.js installed
- A MongoDB Atlas cluster (or local MongoDB instance)

### Installation

```bash
git clone https://github.com/SumanThokdarProg/NoteVault.git
cd NoteVault
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

```env
PORT=3000
NODE_ENV=development
DATABASE_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

> `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` should be long, random strings, and must be different from each other.

### Run the server

```bash
npm start       # production
npm run dev     # development, with nodemon
```

The API will be available at `http://localhost:3000`.

### Run the tests

```bash
npm test
```

Tests run against a temporary, in-memory MongoDB instance (via `mongodb-memory-server`) — no connection to your real Atlas cluster is made, and no real data is touched.

## API Reference

### Auth — `/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Create a new account |
| POST | `/auth/login` | Public | Log in, receive an access token + refresh token cookie |
| POST | `/auth/refresh` | Requires refresh cookie | Issue a new access token |
| POST | `/auth/logout` | Requires refresh cookie | Revoke the current session |
| DELETE | `/auth/account` | Authenticated | Delete own account (requires password confirmation in body) |

### Notes — `/notes`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notes` | Authenticated | Get all of your own notes |
| POST | `/notes` | Authenticated | Create a note |
| GET | `/notes/:id` | Authenticated (owner only) | Get a single note |
| PUT | `/notes/:id` | Authenticated (owner only) | Update a note |
| DELETE | `/notes/:id` | Authenticated (owner only) | Delete a note |
| GET | `/notes/user/:userid` | Admin only | Get a specific user's notes |

### Users — `/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin only | List all users, optionally filtered by `?from=` / `?to=` (account creation date) |

## Authentication Flow

1. **Signup** — email and password are validated, password is hashed with `argon2`, and the user is stored.
2. **Login** — credentials are verified, and two JWTs are issued: a 15-minute access token (returned in the response body) and a 7-day refresh token (stored in the database and set as an `httpOnly` cookie).
3. **Authenticated requests** — the client sends the access token as `Authorization: Bearer <token>`. `authMiddleware` verifies it and attaches the user's id and role to the request.
4. **Refreshing** — when the access token expires, the client calls `/auth/refresh`. The server verifies the refresh token cookie against the record stored in the database and issues a new access token.
5. **Logout** — the refresh token is deleted from the database and its cookie is cleared, immediately invalidating that session.

## Deployment

The API is deployed on [Render](https://render.com), connected directly to this GitHub repository. Render auto-deploys on every push to `master` — no manual redeploy step is needed. The database is hosted on MongoDB Atlas, with network access opened to allow connections from Render's servers (which don't have a fixed IP).

Environment variables are configured directly in Render's dashboard rather than committed to the repo.

## Known Limitations / Roadmap

- **No CORS configuration yet.** The API currently has no `cors` middleware, so browser-based frontends on a different origin cannot call it directly (tools like Postman/Thunder Client aren't affected, since CORS is enforced by browsers). This will be added once the frontend is connected.
- [ ] Pagination on `/notes` and `/users`
- [ ] Rate limiting on login to mitigate brute-force attempts
- [ ] React frontend to consume this API
- [ ] Migrate learned patterns into a NestJS implementation

## License

This project is for personal learning purposes.
