# API Documentation

## Base URL
```
http://localhost:3001/api
```

For production or physical device testing, update this to your server's IP or domain.

## Authentication

All endpoints use a simple header-based authentication for demonstration:
```
x-user-id: <user_identifier>
```

In production, this should be replaced with JWT tokens from Clerk.

---

## Endpoints

### 1. Get Site 02 Status

**GET** `/site02/status`

Retrieves the current status of Site 02 along with user permission information.

#### Headers
```
x-user-id: user_demo123
```

#### Response (200 OK)
```json
{
  "status": "ONLINE",
  "lastUpdated": "2026-01-14T23:30:00.000Z",
  "updatedBy": "user_demo123",
  "userLevel": 5,
  "canEdit": true
}
```

#### Response Fields
- `status` (string): Current site status - "ONLINE", "ALERT", or "LOCKDOWN"
- `lastUpdated` (string): ISO 8601 timestamp of last status change
- `updatedBy` (string|null): User ID who last updated the status
- `userLevel` (number): Current user's permission level (0-5)
- `canEdit` (boolean): Whether current user can edit status (Level 5+)

#### Example
```bash
curl -X GET http://localhost:3001/api/site02/status \
  -H "x-user-id: user_demo123"
```

---

### 2. Update Site 02 Status

**POST** `/site02/status`

Updates the status of Site 02. Requires Level 5 (Admin) permissions.

#### Headers
```
Content-Type: application/json
x-user-id: user_demo123
```

#### Request Body
```json
{
  "status": "LOCKDOWN"
}
```

#### Request Fields
- `status` (string, required): New status - must be "ONLINE", "ALERT", or "LOCKDOWN"

#### Response (200 OK)
```json
{
  "success": true,
  "status": "LOCKDOWN",
  "lastUpdated": "2026-01-14T23:35:00.000Z",
  "updatedBy": "user_demo123"
}
```

#### Response (403 Forbidden) - Insufficient Permissions
```json
{
  "error": "Insufficient permissions. Level 5 (Admin) required to edit."
}
```

#### Response (400 Bad Request) - Invalid Status
```json
{
  "error": "Invalid status. Must be ONLINE, ALERT, or LOCKDOWN."
}
```

#### Example
```bash
# Set to ONLINE
curl -X POST http://localhost:3001/api/site02/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: user_demo123" \
  -d '{"status": "ONLINE"}'

# Set to ALERT
curl -X POST http://localhost:3001/api/site02/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: user_demo123" \
  -d '{"status": "ALERT"}'

# Set to LOCKDOWN
curl -X POST http://localhost:3001/api/site02/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: user_demo123" \
  -d '{"status": "LOCKDOWN"}'
```

---

### 3. Get User Level

**GET** `/user/level`

Retrieves the permission level for the current user.

#### Headers
```
x-user-id: user_demo123
```

#### Response (200 OK)
```json
{
  "userId": "user_demo123",
  "level": 5,
  "canEdit": true
}
```

#### Response Fields
- `userId` (string): User identifier
- `level` (number): User's permission level (0-5)
- `canEdit` (boolean): Whether user can edit site status

#### Example
```bash
curl -X GET http://localhost:3001/api/user/level \
  -H "x-user-id: user_demo123"
```

---

### 4. Update User Level (Admin Only)

**POST** `/user/level`

Updates a user's permission level. Requires Level 5 (Admin) permissions.

#### Headers
```
Content-Type: application/json
x-user-id: admin_user_id
```

#### Request Body
```json
{
  "userId": "target_user_id",
  "level": 5
}
```

#### Request Fields
- `userId` (string, required): ID of user to update
- `level` (number, required): New level (0-5)

#### Response (200 OK)
```json
{
  "success": true,
  "userId": "target_user_id",
  "level": 5
}
```

#### Response (403 Forbidden) - Not Admin
```json
{
  "error": "Insufficient permissions. Admin access required."
}
```

#### Response (400 Bad Request) - Invalid Level
```json
{
  "error": "Invalid level. Must be between 0 and 5."
}
```

#### Example
```bash
# Grant admin access (Level 5)
curl -X POST http://localhost:3001/api/user/level \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin_user" \
  -d '{"userId": "new_admin", "level": 5}'

# Set to read-only (Level 1)
curl -X POST http://localhost:3001/api/user/level \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin_user" \
  -d '{"userId": "readonly_user", "level": 1}'
```

---

## User Level System

### Level Permissions

| Level | Name | Permissions |
|-------|------|-------------|
| 0 | View Only | Can view status only |
| 1 | Read-Only | Can view status only (default for new users) |
| 2 | Read-Only | Can view status only |
| 3 | Read-Only | Can view status only |
| 4 | Read-Only | Can view status only |
| 5 | Admin | Can view and edit status |

### Default User Level
New users automatically receive **Level 1** (Read-Only) when first accessing the system.

---

## Status Values

### Valid Status Values
1. **ONLINE** - Normal operations
   - Color: Green (#16a34a)
   - Icon: Shield
   
2. **ALERT** - Warning state
   - Color: Yellow (#eab308)
   - Icon: Alert Triangle
   
3. **LOCKDOWN** - Critical state
   - Color: Red (#dc2626)
   - Icon: Lock
   - Special: Triggers flashing red background in UI

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200 OK` - Request successful
- `400 Bad Request` - Invalid request data
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Endpoint not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently no rate limiting is implemented. For production:
- Implement rate limiting per user/IP
- Recommend: 100 requests per minute per user
- Status reads: More permissive
- Status updates: More restrictive (10 per minute)

---

## CORS Configuration

The backend is configured to accept requests from any origin for development:
```javascript
app.use(cors());
```

For production, restrict to your frontend domain:
```javascript
app.use(cors({
  origin: 'https://your-app-domain.com'
}));
```

---

## Data Persistence

### Current Implementation (Development)
- **In-Memory Storage**: Data stored in JavaScript variables
- **Not Persistent**: Data lost on server restart
- **Single Instance**: No clustering support

### Production Recommendations
- Use PostgreSQL, MySQL, or MongoDB
- Implement proper schema with indexes
- Add audit logging for all status changes
- Use connection pooling
- Implement backup strategy

---

## Security Considerations

### Current State (Development)
✅ Permission checking on endpoints
✅ Input validation for status values
✅ Admin-only endpoints protected
❌ No real authentication
❌ No encryption
❌ No rate limiting
❌ No audit logging

### Production Requirements
1. Replace `x-user-id` header with JWT authentication
2. Implement HTTPS/SSL encryption
3. Add request rate limiting
4. Implement audit logging
5. Use environment variables for configuration
6. Add request/response validation
7. Implement CSRF protection
8. Add SQL injection prevention (use parameterized queries)
9. Implement proper session management
10. Add monitoring and alerting

---

## Testing the API

### Using cURL
See examples above for each endpoint.

### Using Postman
Import the following collection:
```json
{
  "info": {
    "name": "FCF Site 02 Status API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Site Status",
      "request": {
        "method": "GET",
        "header": [{"key": "x-user-id", "value": "user_demo123"}],
        "url": "http://localhost:3001/api/site02/status"
      }
    }
  ]
}
```

### Using JavaScript/Fetch
```javascript
// Get status
const getStatus = async () => {
  const response = await fetch('http://localhost:3001/api/site02/status', {
    headers: {
      'x-user-id': 'user_demo123'
    }
  });
  const data = await response.json();
  console.log(data);
};

// Update status
const updateStatus = async (newStatus) => {
  const response = await fetch('http://localhost:3001/api/site02/status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'user_demo123'
    },
    body: JSON.stringify({ status: newStatus })
  });
  const data = await response.json();
  console.log(data);
};
```

---

## Changelog

### Version 1.0.0
- Initial API implementation
- Site status management endpoints
- User level management endpoints
- Basic permission system
