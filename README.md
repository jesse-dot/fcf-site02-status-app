# FCF Site 02 Status App

A React Native application built with NativeWind (TailwindCSS) for monitoring and controlling FCF Site 02 status. Features a modern dark dashboard UI with Clerk authentication integration and role-based access control.

## Features

- **Modern Dark UI**: Slate-950 background with Blue-600 accents
- **Authentication**: Clerk integration (new users start at Level 1)
- **User Levels**: 
  - Level 0-4: Read-Only access
  - Level 5: Admin access with edit capabilities
- **Site Status Control**: Toggle between ONLINE, ALERT, and LOCKDOWN states
- **Lockdown Mode**: Red flashing UI when Site 02 is in LOCKDOWN
- **Backend**: Self-hosted Node.js/Express server for status management
- **Icons**: Lucide React Native icons

## Project Structure

```
fcf-site02-status-app/
├── App.tsx                 # Main application component
├── backend/
│   └── server.js          # Node.js/Express backend server
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # TailwindCSS configuration
├── babel.config.js        # Babel configuration with NativeWind
├── tsconfig.json          # TypeScript configuration
└── app.json               # Expo configuration
```

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

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

## Running the Application

### Start the Backend Server

In one terminal, start the Node.js backend:

```bash
npm run server
```

The backend will run on `http://localhost:3001`

### Start the React Native App

In another terminal, start the Expo development server:

```bash
npm start
```

Then choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser

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

The current implementation uses a mock Clerk user for demonstration. To integrate with actual Clerk:

1. Sign up at [clerk.com](https://clerk.com)
2. Get your publishable key
3. Install Clerk Expo SDK (already in dependencies)
4. Replace the mock user in `App.tsx` with real Clerk components:

```tsx
import { ClerkProvider, SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
```

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
- **React Native**: Mobile framework
- **Expo**: Development platform
- **NativeWind**: TailwindCSS for React Native
- **TypeScript**: Type safety
- **Lucide React Native**: Icon system
- **Express.js**: Backend API server

## Security Notes

- In production, implement proper authentication with Clerk
- Secure backend endpoints with proper auth middleware
- Use environment variables for sensitive configuration
- Implement HTTPS for API communication
- Store user levels in a secure database

## License

Private - Authorized Personnel Only

## Version

1.0.0