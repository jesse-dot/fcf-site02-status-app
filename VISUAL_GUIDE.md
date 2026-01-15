# FCF Site 02 Status App - Visual Guide

## App Structure Overview

```
┌─────────────────────────────────────────┐
│  FCF Status Dashboard                   │
│  Site 02 Monitoring System              │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────┐  ┌────────────┐ │
│  │ Level 5 (Admin)   │  │ 👁 View Only│ │
│  └───────────────────┘  └────────────┘ │
│  (Blue-600)           (if Level 0-4)   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        🛡️ SITE 02              │   │
│  │         ONLINE                  │   │
│  │                                 │   │
│  │  Last Updated: [timestamp]      │   │
│  └─────────────────────────────────┘   │
│  (Status Color: Green/Yellow/Red)      │
│                                         │
│  CONTROL PANEL (Level 5 Only)          │
│  ┌─────────────────────────────────┐   │
│  │  🛡️  SET ONLINE                 │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  ⚠️  SET ALERT                  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  🔒 ACTIVATE LOCKDOWN           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  FCF Site 02 Status Application v1.0   │
│  Authorized Personnel Only              │
└─────────────────────────────────────────┘
```

## Color Scheme

### Background
- **Primary Background**: Slate-950 (#020617) - Very dark blue-gray
- **All screens use this dark background**

### Accents
- **Primary Accent**: Blue-600 (#2563eb)
  - User level badge
  - Loading indicators
  - Read-only message border

### Status Colors
- **ONLINE**: Green-600 (#16a34a)
- **ALERT**: Yellow-500 (#eab308)
- **LOCKDOWN**: Red-600 (#dc2626) with flashing animation

## Screen States

### 1. ONLINE Status (Admin View - Level 5)
```
┌─────────────────────────────┐
│ [Blue Badge] Level 5 (Admin)│
├─────────────────────────────┤
│     ┌─────────────┐         │
│     │   🛡️        │         │
│     │  SITE 02    │         │ <- Green Background
│     │  ONLINE     │         │
│     └─────────────┘         │
├─────────────────────────────┤
│ CONTROL PANEL               │
│ [Green]  SET ONLINE    ✓    │ <- Active/Selected
│ [Yellow] SET ALERT          │
│ [Red]    ACTIVATE LOCKDOWN  │
└─────────────────────────────┘
```

### 2. ALERT Status (Admin View - Level 5)
```
┌─────────────────────────────┐
│ [Blue Badge] Level 5 (Admin)│
├─────────────────────────────┤
│     ┌─────────────┐         │
│     │   ⚠️        │         │
│     │  SITE 02    │         │ <- Yellow Background
│     │  ALERT      │         │
│     └─────────────┘         │
├─────────────────────────────┤
│ CONTROL PANEL               │
│ [Green]  SET ONLINE         │
│ [Yellow] SET ALERT      ✓   │ <- Active/Selected
│ [Red]    ACTIVATE LOCKDOWN  │
└─────────────────────────────┘
```

### 3. LOCKDOWN Status (Admin View - Level 5)
```
┌─────────────────────────────┐
│ [Blue Badge] Level 5 (Admin)│
├─────────────────────────────┤
│     ┌─────────────┐         │
│ 🔴  │   🔒        │   🔴    │ <- Red Flashing
│ 🔴  │  SITE 02    │   🔴    │    Background
│ 🔴  │  LOCKDOWN   │   🔴    │    Animation
│     └─────────────┘         │
├─────────────────────────────┤
│ CONTROL PANEL               │
│ [Green]  SET ONLINE         │
│ [Yellow] SET ALERT          │
│ [Red]    ACTIVATE LOCKDOWN ✓│ <- Active/Selected
└─────────────────────────────┘

Animation: Background flashes between 100% and 30% opacity
Timing: 500ms fade out, 500ms fade in, continuous loop
```

### 4. Read-Only View (Level 0-4)
```
┌─────────────────────────────┐
│ [Blue] Level 1 (Read-Only)  │
│                   👁 View Only│
├─────────────────────────────┤
│     ┌─────────────┐         │
│     │   🛡️        │         │
│     │  SITE 02    │         │
│     │  ONLINE     │         │
│     └─────────────┘         │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ ℹ️ You have read-only │   │ <- Blue border
│ │   access. Level 5     │   │    Blue-600/20 bg
│ │   (Admin) required    │   │
│ │   to edit status.     │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
(No control buttons visible)
```

### 5. Loading State
```
┌─────────────────────────────┐
│                             │
│                             │
│        ⏳ (spinning)        │
│                             │
│        Loading...           │
│                             │
│                             │
└─────────────────────────────┘
```

## Icons Used (Lucide React Native)

1. **Shield** - ONLINE status indicator
2. **AlertTriangle** - ALERT status indicator
3. **Lock** - LOCKDOWN status indicator
4. **Eye** - Read-only indicator
5. **Settings** - User level badge icon

## User Interactions

### For Level 5 (Admin) Users:
1. **Tap "SET ONLINE"** → Changes status to ONLINE (green)
2. **Tap "SET ALERT"** → Changes status to ALERT (yellow)
3. **Tap "ACTIVATE LOCKDOWN"** → Changes status to LOCKDOWN (red + flashing)
4. **Visual feedback**: 
   - Button becomes slightly darker when active
   - Loading spinner appears during update
   - Alert confirmation after successful change

### For Level 0-4 (Read-Only) Users:
1. **View status** → Can see current site status
2. **Tap buttons** → Shows alert: "Access Denied - Need Level 5"
3. **No editing** → Control panel is hidden completely

## Technical Details

### Animation Specs
**Lockdown Flash Animation:**
```javascript
Loop:
  - Fade from opacity 1.0 to 0.3 over 500ms
  - Fade from opacity 0.3 to 1.0 over 500ms
  - Repeat indefinitely
  
Color: Red-600 (#dc2626)
Covers: Full screen background
Z-index: Behind content (absolute positioned)
```

### Auto-Refresh
- Polls backend every 5 seconds
- Updates UI automatically if status changes
- Shows last updated timestamp
- No manual refresh needed

### Responsive Design
- Safe area handling for iOS notch
- Proper padding and margins
- Touch targets minimum 44x44 points
- Readable text with high contrast

## Data Flow

```
User opens app
    ↓
[Loading State]
    ↓
Fetch status from backend
    ↓
Display current status + user level
    ↓
If Level 5: Show control panel
If Level 0-4: Show read-only message
    ↓
User taps button (Level 5 only)
    ↓
Send update to backend
    ↓
[Updating State]
    ↓
Backend validates permission
    ↓
Update status in database
    ↓
Return new status to app
    ↓
Refresh UI with new status
    ↓
Show success alert
    ↓
Continue auto-polling every 5s
```

## Platform Compatibility

### iOS
- Supports iPhone and iPad
- Respects safe areas
- Dark mode enforced
- Native iOS alerts

### Android
- Adaptive icon
- Material Design alerts
- Dark theme

### Web (Development)
- Works for quick testing
- Designed for mobile but functional on web

## Accessibility

- High contrast text (white on dark)
- Clear iconography
- Descriptive labels
- Touch-friendly buttons
- Status indicators are both color and icon-based
