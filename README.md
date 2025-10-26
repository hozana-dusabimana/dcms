# DMCS MIS - Digital Marriage and Church Service Management Information System

A modern, full-stack web application built with React and Node.js for managing marriage registrations and church services. The system connects civil registration offices with religious institutions to provide a seamless, digital platform for marriage registration and church service management.

## 🚀 Features

### Core Functionality
- **Marriage Registration**: Digital marriage registration with both civil and religious authorities
- **User Management**: Role-based access control for couples, church leaders, and civil administrators
- **Document Management**: Secure document upload and verification system
- **Real-time Notifications**: Instant notifications for application status updates
- **Certificate Generation**: Digital marriage certificate creation and verification
- **Internal Messaging**: Communication system between different user roles
- **Dashboard Analytics**: Comprehensive reporting and analytics for administrators
- **Password Recovery**: Secure forgot password functionality with email reset
- **Member Portal**: Dedicated portal for church members to access services and provide feedback

### User Roles
- **Couples**: Register marriages, upload documents, track application status
- **Church Leaders**: Review religious ceremonies, manage church services and members
- **Civil Administrators**: Review civil applications, manage sectors
- **Super Administrators**: System-wide management and oversight
- **Church Members**: Access church services, provide feedback, view notifications

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Material-UI (MUI)**: Comprehensive UI component library
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **React Hook Form**: Form handling and validation
- **Socket.io Client**: Real-time communication
- **Axios**: HTTP client for API requests

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MySQL**: Relational database with Sequelize ORM
- **JWT**: JSON Web Tokens for authentication
- **Socket.io**: Real-time bidirectional communication
- **Multer**: File upload handling
- **Bcrypt**: Password hashing
- **Express Validator**: Input validation
- **Nodemailer**: Email service integration

### Development Tools
- **Concurrently**: Run multiple npm scripts simultaneously
- **Nodemon**: Development server with auto-restart
- **ESLint**: Code linting and formatting
- **Jest**: Testing framework

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/hozana-dusabimana/dcms.git
   cd DMCS
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (client and server)
   npm run install-all
   
   # Or install individually
   cd client && npm install
   cd ../server && npm install
   ```

3. **Database Setup**
   ```bash
   # Import the database schema
   mysql -u root -p < database/dmcs_mis.sql
   
   # Or run the database migration scripts
   cd server
   node scripts/addPasswordResetFields.js
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment example file
   cp server/env.example server/.env
   
   # Edit the .env file with your configuration
   nano server/.env
   ```

5. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or start individually
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 🏗️ Project Structure

```
DMCS/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Socket)
│   │   ├── pages/         # Page components
│   │   ├── config/        # Configuration files
│   │   └── App.js         # Main App component
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic services
│   ├── scripts/          # Database migration scripts
│   ├── config/           # Configuration files
│   └── package.json
├── database/             # Database schema and migrations
├── package.json          # Root package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dmcs_mis

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Client URL
CLIENT_URL=http://localhost:3000

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Database Schema

The application uses MySQL with the following main tables:

- **users**: User accounts and authentication
- **marriage_applications**: Marriage registration applications
- **churches**: Religious institutions
- **sectors**: Civil administrative sectors
- **notifications**: System notifications
- **messages**: Internal messaging
- **documents**: File uploads and documents
- **church_members**: Church member information
- **church_services**: Church service management
- **service_requests**: Service request management
- **certificate_requests**: Certificate request management

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/verify-reset-token/:token` - Verify reset token
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Member Authentication
- `POST /api/member-auth/login` - Church member login
- `GET /api/member-auth/verify` - Verify member token

### Applications
- `GET /api/applications` - Get applications (filtered by user role)
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get specific application
- `PUT /api/applications/:id` - Update application
- `PUT /api/applications/:id/approve` - Approve application
- `PUT /api/applications/:id/reject` - Reject application

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/unread-count` - Get unread count
- `GET /api/member-notifications` - Get member notifications

### Church Management
- `GET /api/churches` - Get churches
- `POST /api/churches` - Create church
- `PUT /api/churches/:id` - Update church
- `GET /api/church-members` - Get church members
- `POST /api/church-members` - Add church member
- `GET /api/church-services` - Get church services
- `POST /api/church-services` - Create church service

### Service Requests
- `GET /api/service-requests` - Get service requests
- `POST /api/service-requests` - Create service request
- `PUT /api/service-requests/:id` - Update service request
- `GET /api/service-comments` - Get service comments

### Certificate Management
- `GET /api/certificate-requests` - Get certificate requests
- `POST /api/certificate-requests` - Create certificate request
- `PUT /api/certificate-requests/:id` - Update certificate request
- `GET /api/certificates` - Get certificates

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Password Recovery**: Secure email-based password reset
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Cross-origin resource sharing setup
- **Helmet**: Security headers middleware
- **File Upload Security**: Secure file handling and validation
- **Token Expiration**: Time-limited access tokens

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test

# Run all tests
npm run test
```

## 📊 Monitoring and Analytics

The system includes comprehensive analytics for:
- Application statistics
- User activity tracking
- Performance metrics
- Error logging and monitoring
- Service request analytics
- Certificate generation tracking

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Set production environment**
   ```bash
   export NODE_ENV=production
   ```

3. **Start the production server**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment (Optional)

```dockerfile
# Dockerfile example
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

## 📚 Documentation

- [Forgot Password Guide](FORGOT_PASSWORD_GUIDE.md) - Complete guide for password reset functionality
- [Member Portal Guide](MEMBER_PORTAL_GUIDE.md) - Guide for church member portal features
- [Quick Start Guide](QUICK_START.md) - Quick setup and getting started

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added real-time notifications and messaging
- **v1.2.0** - Enhanced dashboard analytics and reporting
- **v1.3.0** - Added forgot password functionality and member portal
- **v1.4.0** - Enhanced church service management and certificate generation

---

**DMCS MIS** - Streamlining marriage registration and church service management for the digital age.