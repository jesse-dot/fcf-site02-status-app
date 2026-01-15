# Testing Guide for FCF Site 02 Status App

## Quick Start Testing

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend Server

In terminal 1:
```bash
npm run server
```

Expected output:
```
FCF Site 02 Status Backend running on port 3001
Current Site 02 Status: ONLINE
```

### 3. Start the React Native App

In terminal 2:
```bash
npm start
```

## Testing Scenarios

### Scenario 1: View-Only User (Level 1-4)

The default mock user starts at Level 5 for demonstration. To test read-only mode:

1. In `App.tsx`, change line 68 to:
```typescript
userLevel: 1, // Changed from 5
canEdit: false, // Changed from true
```

2. Restart the app
3. Verify:
   - Status is visible
   - User level badge shows "Level 1 (Read-Only)"
   - Eye icon appears next to level badge
   - Control panel buttons are NOT visible
   - Read-only message is displayed

### Scenario 2: Admin User (Level 5)

Default configuration (Level 5):

1. Start the app (default is Level 5)
2. Verify:
   - Status is visible
   - User level badge shows "Level 5 (Admin)"
   - Control panel with three buttons is visible
   - Can click buttons to change status

### Scenario 3: Status Changes

With admin access (Level 5):

1. **Set to ONLINE**:
   - Click "SET ONLINE" button
   - Verify green background on status card
   - Verify Shield icon
   - Verify "ONLINE" text

2. **Set to ALERT**:
   - Click "SET ALERT" button
   - Verify yellow background on status card
   - Verify AlertTriangle icon
   - Verify "ALERT" text

3. **Set to LOCKDOWN**:
   - Click "ACTIVATE LOCKDOWN" button
   - Verify red background on status card
   - Verify Lock icon
   - Verify "LOCKDOWN" text
   - **Verify red flashing background animation**

### Scenario 4: Backend Integration

With backend running:

1. Open app
2. Change status to "ALERT"
3. Check backend terminal - should show the update
4. Use curl to verify:
```bash
curl http://localhost:3001/api/site02/status \
  -H "x-user-id: user_demo123"
```

5. Update user level via API:
```bash
curl -X POST http://localhost:3001/api/site02/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: user_demo123" \
  -d '{"status": "LOCKDOWN"}'
```

6. App should auto-update within 5 seconds (auto-polling)

### Scenario 5: Without Backend

If backend is not running:

1. App will use fallback demo data
2. Changes are stored locally in state
3. Status updates work but don't persist
4. Demonstrates UI/UX without server dependency

## User Level API Testing

### Get User Level
```bash
curl http://localhost:3001/api/user/level \
  -H "x-user-id: user_demo123"
```

### Set User Level to 1 (Read-Only)
```bash
curl -X POST http://localhost:3001/api/user/level \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_demo123", "level": 1}'
```

### Set User Level to 5 (Admin)
```bash
curl -X POST http://localhost:3001/api/user/level \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_demo123", "level": 5}'
```

After changing user level via API, restart the app to see the changes.

## Visual Verification Checklist

- [ ] Dark background (Slate-950) throughout the app
- [ ] Blue-600 accents on user level badge
- [ ] Status card changes color based on status
- [ ] Icons display correctly (Shield, AlertTriangle, Lock, Eye, Settings)
- [ ] Red flashing animation during LOCKDOWN
- [ ] Buttons are properly styled and responsive
- [ ] Text is readable with good contrast
- [ ] Loading indicator appears on initial load
- [ ] Activity indicator shows when updating status

## Known Demo Limitations

1. **Clerk Integration**: Uses mock user instead of real Clerk authentication
2. **Assets**: Placeholder assets (icon.png, splash.png not provided)
3. **Database**: Uses in-memory storage instead of persistent database
4. **API URL**: Hardcoded to localhost:3001 (would need environment variables for production)

## Platform-Specific Testing

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web
```bash
npm run web
```

Note: The app is designed for mobile but can run on web for quick testing.

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Install dependencies: `npm install`
- Check Node.js version (requires 16+)

### App won't start
- Clear Expo cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Styles not working
- Verify NativeWind is properly configured
- Check tailwind.config.js exists
- Restart metro bundler

### Backend connection fails
- Verify backend is running on port 3001
- Check API_BASE_URL in App.tsx
- For mobile devices, use your computer's IP address instead of localhost
