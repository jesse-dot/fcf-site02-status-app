# FCF Site 02 Status App

A web-based React application built with Vite and TailwindCSS for monitoring and controlling FCF Site 02 status. Features a modern dark dashboard UI with Clerk authentication integration and role-based access control.

## Features

- **Modern Dark UI**: Slate-950 background with Blue-600 accents
- **Web Browser Only**: Runs in any modern web browser
- **Authentication**: Clerk authentication with sign-in/sign-out (new users start at Level 1)
- **User Levels**: 
  - Level 0-4: Read-Only access
  - Level 5: Admin access with edit capabilities
- **Site Status Control**: Toggle between ONLINE, ALERT, and LOCKDOWN states
- **Lockdown Mode**: Red flashing UI when Site 02 is in LOCKDOWN
- **Backend**: Self-hosted Node.js/Express server for status management
- **Icons**: Lucide React icons

## Project Structure

```
fcf-site02-status-app/
├── src/
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles with TailwindCSS
├── backend/
│   └── server.js          # Node.js/Express backend server
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # TailwindCSS configuration
├── vite.config.ts         # Vite build configuration
└── tsconfig.json          # TypeScript configuration
```

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jesse-dot/fcf-site02-status-app.git
cd fcf-site02-status-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your Clerk publishable key
```

You must set `VITE_CLERK_PUBLISHABLE_KEY` in your `.env` file before running the app.

## Running the Application

### Start the Backend Server

In one terminal, start the Node.js backend:

```bash
npm run server
```

The backend will run on `http://localhost:3001`

### Start the Web Application

In another terminal, start the Vite development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

Open your web browser and navigate to `http://localhost:3000`

## Configuration

### Backend API

The backend server runs on port 3001 by default. To change the port, set the `PORT` environment variable:

```bash
PORT=3002 npm run server
```

### User Levels

User levels are managed by the backend server. By default:
- New users get Level 1 (Read-Only)
- User levels can be updated via the `/api/user/level` endpoint

To grant admin access (Level 5) to a user:

```bash
curl -X POST http://localhost:3001/api/user/level \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_demo123", "level": 5}'
```

### Clerk Authentication

This application uses Clerk for authentication. To set it up:

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application in the Clerk dashboard
3. Get your publishable key from the API Keys section
4. Create a `.env` file in the project root:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

5. (Optional) Set a custom API URL if needed:

```bash
VITE_API_URL=http://localhost:3001/api
```

New users will automatically start at Level 1 (Read-Only). To grant admin access, see the User Levels section below.

## API Endpoints

### GET /api/site02/status
Get current Site 02 status and user permissions

**Headers:**
- `x-user-id`: User identifier

**Response:**
```json
{
  "status": "ONLINE",
  "lastUpdated": "2026-01-14T23:00:00.000Z",
  "updatedBy": "user_id",
  "userLevel": 5,
  "canEdit": true
}
```

### POST /api/site02/status
Update Site 02 status (Level 5+ only)

**Headers:**
- `x-user-id`: User identifier
- `Content-Type`: application/json

**Body:**
```json
{
  "status": "LOCKDOWN"
}
```

### GET /api/user/level
Get user level information

### POST /api/user/level
Update user level (admin endpoint)

## Status Types

- **ONLINE**: Normal operations (Green)
- **ALERT**: Warning state (Yellow)
- **LOCKDOWN**: Critical state with flashing red UI (Red)

## Permissions System

- **Level 0-4**: Read-Only access - can view status but cannot change it
- **Level 5**: Admin access - can toggle between all status states

## UI Features

- Modern dark dashboard with Slate-950 background
- Blue-600 accent colors
- Status-specific color coding (Green/Yellow/Red)
- Animated red flashing background during LOCKDOWN
- Real-time status updates (polls every 5 seconds)
- Lucide icons for visual clarity
- User level badge showing current permissions

## Development

The application is built with:
- **React**: UI framework
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **TypeScript**: Type safety
- **Lucide React**: Icon system
- **Express.js**: Backend API server

## Production Build

To create a production build:

```bash
npm run build
```

The build output will be in the `dist/` directory. You can preview the production build:

```bash
npm run preview
```

## Security Notes

- Clerk authentication is fully integrated for user sign-in/sign-out
- Backend endpoints use Clerk user IDs for permission checking
- User levels should be stored in a secure database for production
- Use environment variables for Clerk keys and API configuration
- Implement HTTPS for API communication in production
- Consider adding Clerk webhook integration for user management

## License

Private - Authorized Personnel Only

## Version

1.0.0