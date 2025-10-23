# Test Management System (TMS)

A comprehensive MERN stack application for managing academic assessments, built with modern web technologies and designed for educational institutions.

## 🚀 Features

### 🔐 Authentication & Authorization
- **Multi-role authentication** (Admin, Teacher, Student)
- **JWT-based security** with refresh tokens
- **Role-based access control** for all endpoints
- **Secure password hashing** with bcrypt

### 👨‍💼 Admin Features
- **User Management**: Create, update, delete users
- **Class & Section Control**: Manage academic structure
- **System Administration**: Full system oversight
- **Request Management**: Handle profile and subject assignment requests
- **Dashboard Analytics**: Real-time system statistics

### 👨‍🏫 Teacher Features
- **Test Creation**: Build comprehensive assessments
- **Question Management**: Multiple choice, true/false, fill-in-blank
- **Student Groups**: Create custom student groupings
- **Reports & Analytics**: Generate PDF and Excel reports
- **Performance Tracking**: Monitor student progress

### 👨‍🎓 Student Features
- **Test Participation**: Take scheduled assessments
- **Performance Dashboard**: View results and progress
- **Report Downloads**: Access personal performance reports
- **Profile Management**: Update personal information

### 📊 System Features
- **Real-time Updates**: Live notifications and updates
- **Activity Logging**: Comprehensive audit trail
- **Email Integration**: Automated notifications
- **Report Generation**: PDF and Excel exports
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email services
- **PDFKit** for PDF generation
- **ExcelJS** for Excel reports

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management

## 📁 Project Structure

```
test-management-system/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test-management-system
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/test-management-system
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_EXPIRE=24h
   JWT_REFRESH_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

   Create `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Teacher Endpoints
- `GET /api/teacher/dashboard` - Teacher dashboard
- `GET /api/teacher/tests` - Get teacher's tests
- `POST /api/teacher/tests` - Create new test
- `GET /api/teacher/reports` - Generate reports

### Student Endpoints
- `GET /api/student/dashboard` - Student dashboard
- `GET /api/student/tests` - Get available tests
- `POST /api/student/tests/:id/attempt` - Attempt test
- `GET /api/student/results` - Get test results

## 🗄️ Database Schema

### Core Models
- **User**: Admin, Teacher, Student profiles
- **Class**: Academic classes/grades
- **Section**: Class sections
- **Subject**: Academic subjects
- **Test**: Assessment tests
- **Question**: Test questions
- **Result**: Student test results
- **StudentGroup**: Custom student groupings

### System Models
- **ActivityLog**: User activity tracking
- **ProfileChangeRequest**: Profile update requests
- **SubjectAssignmentRequest**: Subject assignment requests

## 🔒 Security Features

- **Password Encryption**: Bcrypt with salt rounds
- **JWT Tokens**: Secure authentication
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Request data sanitization
- **Role-based Access**: Granular permissions

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application
3. Deploy to your preferred hosting service (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the production version
2. Deploy to static hosting (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and authorization
  - Admin dashboard and user management
  - Basic test management structure
  - Responsive UI with Tailwind CSS

---

**Built with ❤️ for educational institutions worldwide**
