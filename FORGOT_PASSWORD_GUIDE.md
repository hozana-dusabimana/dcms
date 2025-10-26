# Forgot Password Functionality Guide

## Overview
The DMCS MIS now includes a complete forgot password functionality that allows users to reset their passwords via email.

## Features

### 1. Forgot Password Page (`/forgot-password`)
- Clean, user-friendly interface matching the login page design
- Email validation with proper error handling
- Success/error message display
- Link back to login page

### 2. Reset Password Page (`/reset-password/:token`)
- Token validation before allowing password reset
- Password confirmation field with validation
- Secure token-based password reset
- Automatic redirect to login after successful reset

### 3. Backend API Endpoints

#### POST `/api/auth/forgot-password`
- Validates email address
- Generates secure reset token (32-byte random hex)
- Sets token expiration (1 hour)
- Sends professional HTML email with reset link
- Handles inactive accounts appropriately

#### GET `/api/auth/verify-reset-token/:token`
- Validates reset token
- Checks token expiration
- Returns token validity status

#### POST `/api/auth/reset-password`
- Validates reset token and expiration
- Updates user password securely
- Clears reset token after successful reset
- Proper error handling for invalid/expired tokens

### 4. Database Changes
- Added `reset_password_token` field to users table
- Added `reset_password_expires` field to users table
- Migration script included for easy setup

### 5. Email Integration
- Professional HTML email template
- Responsive design with DMCS branding
- Clear call-to-action button
- Fallback text link
- Security warnings and instructions

## Security Features

1. **Token Security**
   - 32-byte cryptographically secure random tokens
   - 1-hour expiration time
   - Single-use tokens (cleared after use)

2. **Email Validation**
   - Proper email format validation
   - Account existence checking
   - Active account verification

3. **Password Security**
   - Minimum 6 character requirement
   - Password confirmation validation
   - Secure password hashing (bcrypt)

4. **Error Handling**
   - No information leakage about account existence
   - Proper error messages for different scenarios
   - Rate limiting considerations (can be added)

## Usage

### For Users
1. Click "Forgot your password?" on login page
2. Enter registered email address
3. Check email for reset instructions
4. Click reset link in email
5. Enter new password and confirmation
6. Successfully reset password and login

### For Administrators
1. Ensure email configuration is set up in `server/config/email.js`
2. Set `CLIENT_URL` environment variable for proper reset links
3. Monitor email delivery and user feedback
4. Database migration runs automatically on first setup

## Files Modified/Created

### Frontend
- `client/src/pages/ForgotPassword.js` - New forgot password page
- `client/src/pages/ResetPassword.js` - New reset password page
- `client/src/pages/Login.js` - Added forgot password link
- `client/src/pages/MemberLogin.js` - Added forgot password link
- `client/src/App.js` - Added new routes

### Backend
- `server/routes/auth.js` - Added forgot/reset password endpoints
- `server/models/User.js` - Added password reset fields
- `server/scripts/addPasswordResetFields.js` - Database migration script

### Configuration
- `server/config/email.js` - Email service configuration (already existed)

## Environment Variables

Make sure these are set in your `.env` file:
```
CLIENT_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-jwt-secret
```

## Testing

1. Start the server: `cd server && npm start`
2. Start the client: `cd client && npm start`
3. Navigate to login page
4. Click "Forgot your password?"
5. Enter a valid email address
6. Check email for reset link
7. Click reset link and set new password
8. Login with new password

## Troubleshooting

### Common Issues
1. **Email not sending**: Check email configuration and credentials
2. **Token invalid**: Check if token has expired (1 hour limit)
3. **Database errors**: Ensure migration script ran successfully
4. **CORS issues**: Verify client URL configuration

### Debug Steps
1. Check server logs for error messages
2. Verify database schema has password reset fields
3. Test email configuration independently
4. Check network requests in browser dev tools

## Future Enhancements

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Email Templates**: Create more email templates for different scenarios
3. **Audit Logging**: Log password reset attempts for security
4. **SMS Option**: Add SMS-based password reset as alternative
5. **Password History**: Prevent reuse of recent passwords
6. **Account Lockout**: Lock account after multiple failed attempts
