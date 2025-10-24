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

### User Roles
- **Couples**: Register marriages, upload documents, track application status
- **Church Leaders**: Review religious ceremonies, manage church services
- **Civil Administrators**: Review civil applications, manage sectors
- **Super Administrators**: System-wide management and oversight

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
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Socket.io**: Real-time bidirectional communication
- **Multer**: File upload handling
- **Bcrypt**: Password hashing
- **Express Validator**: Input validation

### Development Tools
- **Concurrently**: Run multiple npm scripts simultaneously
- **Nodemon**: Development server with auto-restart
- **ESLint**: Code linting and formatting
- **Jest**: Testing framework

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dmcs-mis
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment example file
   cp server/env.example server/.env
   
   # Edit the .env file with your configuration
   nano server/.env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   
   # Or if using MongoDB locally
   mongod
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
   - API Documentation: http://localhost:5000/api/health

## 🏗️ Project Structure

```
dmcs-mis/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Socket)
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── controllers/      # Route controllers
│   ├── utils/           # Utility functions
│   └── package.json
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

# Database
MONGODB_URI=mongodb://localhost:27017/dmcs-mis

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Client URL
CLIENT_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Database Schema

The application uses MongoDB with the following main collections:

- **Users**: User accounts and authentication
- **MarriageApplications**: Marriage registration applications
- **Churches**: Religious institutions
- **Sectors**: Civil administrative sectors
- **Notifications**: System notifications
- **Messages**: Internal messaging
- **Documents**: File uploads and documents

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```bash
   export NODE_ENV=production
   ```

3. **Start the production server**
   ```bash
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

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

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

### Messages
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Cross-origin resource sharing setup
- **Helmet**: Security headers middleware
- **File Upload Security**: Secure file handling and validation

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

---

**DMCS MIS** - Streamlining marriage registration and church service management for the digital age.
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

### User Roles
- **Couples**: Register marriages, upload documents, track application status
- **Church Leaders**: Review religious ceremonies, manage church services
- **Civil Administrators**: Review civil applications, manage sectors
- **Super Administrators**: System-wide management and oversight

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
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Socket.io**: Real-time bidirectional communication
- **Multer**: File upload handling
- **Bcrypt**: Password hashing
- **Express Validator**: Input validation

### Development Tools
- **Concurrently**: Run multiple npm scripts simultaneously
- **Nodemon**: Development server with auto-restart
- **ESLint**: Code linting and formatting
- **Jest**: Testing framework

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dmcs-mis
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment example file
   cp server/env.example server/.env
   
   # Edit the .env file with your configuration
   nano server/.env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   
   # Or if using MongoDB locally
   mongod
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
   - API Documentation: http://localhost:5000/api/health

## 🏗️ Project Structure

```
dmcs-mis/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Socket)
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── controllers/      # Route controllers
│   ├── utils/           # Utility functions
│   └── package.json
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

# Database
MONGODB_URI=mongodb://localhost:27017/dmcs-mis

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Client URL
CLIENT_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Database Schema

The application uses MongoDB with the following main collections:

- **Users**: User accounts and authentication
- **MarriageApplications**: Marriage registration applications
- **Churches**: Religious institutions
- **Sectors**: Civil administrative sectors
- **Notifications**: System notifications
- **Messages**: Internal messaging
- **Documents**: File uploads and documents

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```bash
   export NODE_ENV=production
   ```

3. **Start the production server**
   ```bash
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

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

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

### Messages
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Cross-origin resource sharing setup
- **Helmet**: Security headers middleware
- **File Upload Security**: Secure file handling and validation

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

---

**DMCS MIS** - Streamlining marriage registration and church service management for the digital age.