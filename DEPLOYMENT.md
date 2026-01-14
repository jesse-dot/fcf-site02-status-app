# Deployment Guide

## Quick Start (Development)

### Prerequisites Check
```bash
# Check Node.js version (needs 16+)
node --version

# Check npm version
npm --version
```

### Installation
```bash
# 1. Clone repository
git clone https://github.com/jesse-dot/fcf-site02-status-app.git
cd fcf-site02-status-app

# 2. Install dependencies
npm install

# 3. (Optional) Copy environment file
cp .env.example .env
```

### Running Locally

#### Terminal 1 - Start Backend
```bash
npm run server
```
Expected output:
```
FCF Site 02 Status Backend running on port 3001
Current Site 02 Status: ONLINE
```

#### Terminal 2 - Start App
```bash
npm start
```
Then press:
- `i` for iOS simulator
- `a` for Android emulator  
- `w` for web browser

## Testing on Physical Device

### 1. Find Your Computer's IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for your local IP (e.g., `192.168.1.100`)

### 2. Update Environment

Create a `.env` file:
```bash
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3001/api
```

Example:
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
```

### 3. Ensure Same Network
- Phone and computer must be on same WiFi network
- Disable VPN if connection fails
- Check firewall allows port 3001

### 4. Start Backend with Network Access
```bash
# Backend already accepts all connections by default
npm run server
```

### 5. Scan QR Code
- Open Expo Go app on phone
- Scan QR code from terminal
- App will load and connect to backend

## Production Deployment

### Backend Deployment

#### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repository
git clone https://github.com/jesse-dot/fcf-site02-status-app.git
cd fcf-site02-status-app

# 4. Install dependencies
npm install --production

# 5. Install PM2 for process management
sudo npm install -g pm2

# 6. Start backend with PM2
pm2 start backend/server.js --name fcf-site02-api
pm2 save
pm2 startup
```

#### Option 2: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY backend ./backend
EXPOSE 3001
CMD ["node", "backend/server.js"]
```

Deploy:
```bash
# Build image
docker build -t fcf-site02-api .

# Run container
docker run -d -p 3001:3001 --name fcf-site02-api fcf-site02-api
```

#### Option 3: Heroku

```bash
# 1. Create Procfile
echo "web: node backend/server.js" > Procfile

# 2. Deploy
heroku create fcf-site02-api
git push heroku main
```

### Frontend Deployment

#### Option 1: Expo EAS Build (Recommended)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure build
eas build:configure

# 4. Build for iOS
eas build --platform ios

# 5. Build for Android
eas build --platform android

# 6. Submit to stores
eas submit --platform ios
eas submit --platform android
```

#### Option 2: Expo Classic Build

```bash
# iOS
expo build:ios

# Android
expo build:android
```

### Environment Configuration

#### Production .env
```bash
# Backend URL
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api

# Clerk Configuration (when implementing)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

### Database Setup (Production)

Replace in-memory storage with PostgreSQL:

```javascript
// backend/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create tables
await pool.query(`
  CREATE TABLE IF NOT EXISTS site_status (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(255)
  );
  
  CREATE TABLE IF NOT EXISTS user_levels (
    user_id VARCHAR(255) PRIMARY KEY,
    level INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`);
```

### HTTPS/SSL Setup

Using nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Clerk Authentication Setup

1. **Sign up at clerk.com**

2. **Create application**

3. **Get publishable key**

4. **Update App.tsx:**
```tsx
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <MainApp />
    </ClerkProvider>
  );
}

function MainApp() {
  const { userId } = useAuth();
  const { user } = useUser();
  
  // Replace mockClerkUser with real user data
  // userId is now available for API calls
}
```

5. **Update backend to verify Clerk tokens:**
```javascript
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

app.use('/api', ClerkExpressRequireAuth());

app.get('/api/site02/status', (req, res) => {
  const userId = req.auth.userId;
  // Use real userId from Clerk
});
```

## Monitoring

### Backend Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs fcf-site02-api

# Status
pm2 status
```

### Error Tracking

Integrate Sentry:
```bash
npm install @sentry/node
```

```javascript
// backend/server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, AWS ELB)
- Run multiple backend instances
- Use Redis for shared session storage
- Implement rate limiting

### Database Scaling
- Connection pooling
- Read replicas
- Caching layer (Redis)
- Regular backups

## Security Checklist

- [ ] HTTPS enabled
- [ ] Real authentication (Clerk)
- [ ] Environment variables secured
- [ ] Database credentials in secrets
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] CORS configured for production domain only
- [ ] Regular security updates
- [ ] Audit logging enabled

## Backup Strategy

```bash
# Backup database daily
0 0 * * * pg_dump $DATABASE_URL > backup_$(date +\%Y\%m\%d).sql

# Backup to S3
aws s3 cp backup_$(date +\%Y\%m\%d).sql s3://your-bucket/backups/
```

## Rollback Plan

```bash
# If new version has issues
pm2 stop fcf-site02-api
git checkout previous-stable-tag
npm install
pm2 restart fcf-site02-api
```

## Health Checks

Add health endpoint:
```javascript
// backend/server.js
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
```

Monitor:
```bash
# UptimeRobot, Pingdom, or custom script
curl https://your-api.com/health
```

## Support

For issues:
1. Check logs: `pm2 logs`
2. Verify environment variables
3. Test health endpoint
4. Check database connection
5. Review recent commits

## Cost Estimation

### Development
- Free (localhost)

### Production (Monthly)
- VPS (DigitalOcean): $5-20
- Database (managed): $15-50
- Expo EAS: $29+ for builds
- Domain: $10/year
- SSL: Free (Let's Encrypt)

**Total: ~$50-100/month**

## Updates

```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Version Management

Use semantic versioning:
- Patch: Bug fixes (1.0.1)
- Minor: New features (1.1.0)
- Major: Breaking changes (2.0.0)

Tag releases:
```bash
git tag v1.0.0
git push origin v1.0.0
```
