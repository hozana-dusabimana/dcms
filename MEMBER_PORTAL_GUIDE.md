# Church Member Portal - Implementation Guide

## Overview

The Church Member Portal is a new feature that allows church members to access a dedicated dashboard using only their phone number. Members can view scheduled church services and provide comments, concerns, or suggestions about these services.

## Features

### 🔐 Phone Number Authentication
- Members can log in using only their registered phone number
- No password required - simplified authentication process
- JWT token-based session management
- Automatic token verification and refresh

### 📅 Service Viewing
- View all upcoming church services for their church
- See service details including:
  - Service title and description
  - Date and time
  - Location
  - Officiant information
  - Service type and status
  - Current and maximum attendees

### 💬 Comment System
- Add comments to any church service
- Comment types:
  - **General Comment**: General feedback or thoughts
  - **Concern**: Express concerns about the service
  - **Suggestion**: Provide suggestions for improvement
  - **Cancellation Reason**: Explain why a service might not take place
- Anonymous commenting option
- View existing comments from other members

## Technical Implementation

### Backend Components

#### 1. Database Models

**ServiceComment Model** (`server/models/ServiceComment.js`)
```javascript
- id: Primary key
- serviceId: Foreign key to church_services
- memberId: Foreign key to church_members
- comment: Text content
- commentType: ENUM (general, concern, suggestion, cancellation_reason)
- isAnonymous: Boolean flag
- isRead: Boolean flag for admin tracking
```

#### 2. API Routes

**Member Authentication** (`server/routes/memberAuth.js`)
- `POST /api/member-auth/login` - Login with phone number
- `GET /api/member-auth/verify` - Verify JWT token

**Service Comments** (`server/routes/serviceComments.js`)
- `GET /api/service-comments/services` - Get services for member's church
- `POST /api/service-comments` - Add comment to service
- `GET /api/service-comments/:serviceId` - Get comments for specific service
- `PUT /api/service-comments/:id` - Update comment (author only)
- `DELETE /api/service-comments/:id` - Delete comment (author only)

#### 3. Database Migration
Run the migration script to create the service_comments table:
```bash
cd server
node scripts/createServiceCommentsTable.js
```

### Frontend Components

#### 1. Authentication Context
**MemberAuthContext** (`client/src/contexts/MemberAuthContext.js`)
- Manages member authentication state
- Handles JWT token storage and verification
- Provides login/logout functionality

#### 2. Pages

**MemberLogin** (`client/src/pages/MemberLogin.js`)
- Simple phone number input form
- Beautiful gradient background design
- Error handling and loading states

**MemberDashboard** (`client/src/pages/MemberDashboard.js`)
- Displays church services in card format
- Comment dialog for adding feedback
- Service details with status indicators
- Member information display

#### 3. Protected Routes
**MemberProtectedRoute** (`client/src/components/MemberProtectedRoute.js`)
- Protects member-only routes
- Redirects to login if not authenticated
- Loading state during token verification

## Setup Instructions

### 1. Database Setup
```bash
# Create the service_comments table
cd server
node scripts/createServiceCommentsTable.js

# Seed sample member data (optional)
node scripts/seedMemberData.js
```

### 2. Environment Variables
Ensure your `.env` file has:
```env
JWT_SECRET=your_jwt_secret_here
```

### 3. Start the Application
```bash
# Start the server
cd server
npm start

# Start the client (in another terminal)
cd client
npm start
```

## Usage Guide

### For Church Members

1. **Access the Portal**
   - Navigate to the main website
   - Click "Member Portal" in the navigation
   - Or go directly to `/member-login`

2. **Login**
   - Enter your registered phone number
   - Click "Access Dashboard"
   - You'll be redirected to your dashboard

3. **View Services**
   - See all upcoming services for your church
   - View service details, dates, and locations
   - Check service status and attendee information

4. **Add Comments**
   - Click "Add Comment" on any service
   - Choose comment type (General, Concern, Suggestion, Cancellation Reason)
   - Option to post anonymously
   - Submit your feedback

### For Church Administrators

1. **Manage Members**
   - Use the existing Church Members management in the admin dashboard
   - Ensure members have valid phone numbers
   - Set membership status to "active"

2. **Create Services**
   - Use the Church Services management in the admin dashboard
   - Set services as "public" to make them visible to members
   - Add detailed descriptions and locations

3. **Monitor Comments**
   - Comments are stored in the database
   - Can be viewed through the service details
   - Consider implementing admin notification system for concerns

## Sample Data

The system includes sample members for testing:
- **John Doe**: +1234567890
- **Jane Smith**: +1234567891  
- **Mike Johnson**: +1234567892

## Security Features

- JWT token-based authentication
- Member can only see services from their church
- Members can only edit/delete their own comments
- Phone number validation
- Active membership status checking

## Future Enhancements

1. **Admin Dashboard Integration**
   - View all comments in admin panel
   - Comment moderation features
   - Notification system for new comments

2. **Enhanced Features**
   - Service RSVP functionality
   - Push notifications for service updates
   - Member profile management
   - Service reminders

3. **Mobile Optimization**
   - Progressive Web App (PWA) features
   - Offline capability
   - Mobile-specific UI improvements

## Troubleshooting

### Common Issues

1. **Login Fails**
   - Verify phone number is registered in the system
   - Check if member status is "active"
   - Ensure phone number format is correct

2. **No Services Visible**
   - Verify services are marked as "public"
   - Check if services belong to member's church
   - Ensure services have future dates

3. **Comments Not Saving**
   - Check JWT token validity
   - Verify member authentication
   - Check database connection

### Database Queries for Debugging

```sql
-- Check member data
SELECT * FROM church_members WHERE phone = '+1234567890';

-- Check services for a church
SELECT * FROM church_services WHERE church_id = 1 AND is_public = 1;

-- Check comments for a service
SELECT sc.*, cm.first_name, cm.last_name 
FROM service_comments sc 
JOIN church_members cm ON sc.member_id = cm.id 
WHERE sc.service_id = 1;
```

## API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/member-auth/login
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

#### Verify Token
```http
GET /api/member-auth/verify
Headers: x-auth-token: <jwt_token>
```

### Service Comment Endpoints

#### Get Services
```http
GET /api/service-comments/services
Headers: x-auth-token: <jwt_token>
```

#### Add Comment
```http
POST /api/service-comments
Headers: x-auth-token: <jwt_token>
Content-Type: application/json

{
  "serviceId": 1,
  "comment": "Looking forward to this service!",
  "commentType": "general",
  "isAnonymous": false
}
```

## Conclusion

The Church Member Portal provides a simple, accessible way for church members to stay informed about services and provide valuable feedback. The phone number-based authentication makes it easy for members to access the system without complex login procedures, while the comment system enables two-way communication between members and church leadership.

The implementation is secure, scalable, and ready for production use with proper database setup and member data management.






