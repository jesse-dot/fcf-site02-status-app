const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data store
let siteStatus = {
  site02: {
    status: 'ONLINE', // ONLINE, ALERT, LOCKDOWN
    lastUpdated: new Date().toISOString(),
    updatedBy: null
  }
};

// User levels database (simulated)
// In production, this would be in a real database
const userLevels = {
  // Example users with their levels
  // Clerk user IDs would be mapped here
  'default': 1, // New users get Level 1
};

// Middleware to check user level (simplified - would integrate with Clerk in production)
function checkUserLevel(req, res, next) {
  const userId = req.headers['x-user-id'] || 'default';
  const userLevel = userLevels[userId] || 1; // Default to Level 1 for new users
  req.userLevel = userLevel;
  req.userId = userId;
  next();
}

// Get current site status
app.get('/api/site02/status', checkUserLevel, (req, res) => {
  res.json({
    ...siteStatus.site02,
    userLevel: req.userLevel,
    canEdit: req.userLevel >= 5
  });
});

// Update site status (Level 5+ only)
app.post('/api/site02/status', checkUserLevel, (req, res) => {
  if (req.userLevel < 5) {
    return res.status(403).json({
      error: 'Insufficient permissions. Level 5 (Admin) required to edit.'
    });
  }

  const { status } = req.body;
  
  if (!['ONLINE', 'ALERT', 'LOCKDOWN'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status. Must be ONLINE, ALERT, or LOCKDOWN.'
    });
  }

  siteStatus.site02 = {
    status,
    lastUpdated: new Date().toISOString(),
    updatedBy: req.userId
  };

  res.json({
    success: true,
    ...siteStatus.site02
  });
});

// Get user level
app.get('/api/user/level', checkUserLevel, (req, res) => {
  res.json({
    userId: req.userId,
    level: req.userLevel,
    canEdit: req.userLevel >= 5
  });
});

// Update user level (admin endpoint - would be protected in production)
app.post('/api/user/level', (req, res) => {
  const { userId, level } = req.body;
  
  if (level < 0 || level > 5) {
    return res.status(400).json({
      error: 'Invalid level. Must be between 0 and 5.'
    });
  }

  userLevels[userId] = level;
  
  res.json({
    success: true,
    userId,
    level
  });
});

app.listen(PORT, () => {
  console.log(`FCF Site 02 Status Backend running on port ${PORT}`);
  console.log(`Current Site 02 Status: ${siteStatus.site02.status}`);
});
