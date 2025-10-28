# Test Management System - MERN Stack

A comprehensive academic assessment platform built with MongoDB, Express.js, React, and Node.js.

## 🌟 Features

### Multi-Role Authentication System
- **Admin Dashboard**: Manage users, classes, sections, subjects, and approval workflows
- **Teacher Dashboard**: Create tests, manage questions, student groups, and generate reports
- **Student Dashboard**: Attempt tests, view results, track performance analytics

### Core Functionality
- **Test Creation & Management**: Schedule tests with customizable duration, marks, and questions
- **Real-time Test Taking**: Students can attempt tests within scheduled time windows
- **Automated Grading**: Instant evaluation with detailed answer-wise feedback
- **Reports & Analytics**: PDF and Excel exports for performance tracking
- **Request Management**: Approval workflows for profile changes and subject assignments
- **Email Notifications**: Automated email system using Nodemailer
- **Activity Logging**: Complete audit trail of all system actions

## 🏗️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **PDFKit** for PDF generation
- **ExcelJS** for Excel reports
- **Nodemailer** for email service

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Icons** for UI icons

## 📁 Project Structure

```
test-management-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middlewares/     # Auth, validation, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # External services
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React Context (Auth)
│   │   ├── layouts/     # Layout components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service
│   │   └── utils/       # Helper functions
│   └── index.html
│
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/test_management_system
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CLIENT_URL=http://localhost:5173
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📊 Database Models

### User Models
- **Admin**: System administrators with full access
- **Teacher**: Create tests, manage questions, view reports
- **Student**: Attempt tests, view results and analytics

### Academic Models
- **Class**: Grade levels with sections
- **Section**: Student groups within classes
- **Subject**: Courses with assigned teachers
- **Test**: Assessments with questions and scheduling
- **Question**: Multiple-choice questions with correct answers
- **Result**: Student test submissions with grades

### System Models
- **ActivityLog**: Audit trail of all actions
- **ProfileChangeRequest**: Student/Teacher profile update requests
- **SubjectAssignmentRequest**: Teacher subject assignment requests
- **StudentGroup**: Custom student groupings for targeted tests

## 🔐 Default Credentials

For testing purposes, you can use these default credentials:

**Admin:**
- Email: admin@test.com
- Password: Test@123

**Teacher:**
- Email: teacher@test.com
- Password: Test@123

**Student:**
- Email: student@test.com
- Password: Test@123

> **Note**: Create these users manually through the database or admin panel after initial setup.

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Admin Routes
- `POST /api/admin/teachers` - Create teacher
- `POST /api/admin/students` - Create student
- `GET /api/admin/teachers` - Get all teachers
- `GET /api/admin/students` - Get all students
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/classes` - Create class
- `POST /api/admin/sections` - Create section
- `POST /api/admin/subjects` - Create subject

### Teacher Routes
- `POST /api/teacher/tests` - Create test
- `GET /api/teacher/tests` - Get teacher's tests
- `PUT /api/teacher/tests/:id` - Update test
- `DELETE /api/teacher/tests/:id` - Delete test
- `PUT /api/teacher/tests/:id/publish` - Publish test
- `POST /api/teacher/tests/:testId/questions` - Add question
- `PUT /api/teacher/questions/:id` - Update question
- `DELETE /api/teacher/questions/:id` - Delete question
- `GET /api/teacher/tests/:testId/results` - Get test results
- `POST /api/teacher/groups` - Create student group

### Student Routes
- `GET /api/student/tests` - Get available tests
- `GET /api/student/tests/:testId` - Get test details
- `POST /api/student/tests/:testId/start` - Start test
- `POST /api/student/tests/:testId/submit` - Submit test
- `GET /api/student/results` - Get student results
- `GET /api/student/results/:resultId` - Get result details
- `GET /api/student/analytics` - Get performance analytics

## 🎨 Frontend Pages

### Admin Pages
- Dashboard - Overview statistics
- Teachers - Manage teacher accounts
- Students - Manage student accounts
- Classes - Manage classes and sections
- Subjects - Manage subjects
- Requests - Approve/reject requests

### Teacher Pages
- Dashboard - Test statistics
- Tests - Create and manage tests
- Groups - Manage student groups
- Reports - Generate performance reports

### Student Pages
- Dashboard - Performance overview
- Tests - Available tests for attempt
- Results - View test results
- Analytics - Performance analytics

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Secure session management

## 📝 Key Features Implementation

### Test Management
1. Teachers create tests with title, subject, class, section
2. Add multiple-choice questions with options
3. Set duration, total marks, and passing marks
4. Publish test to make it available to students

### Test Taking
1. Students see available tests based on schedule
2. Can only attempt during active time window
3. Submit answers before time expires
4. Automatic grading upon submission

### Result Generation
1. Instant result calculation
2. Question-wise answer analysis
3. Pass/fail status based on passing marks
4. Downloadable PDF reports

### Reports & Analytics
1. Student performance tracking
2. Subject-wise analytics
3. Test-wise performance
4. Excel export for data analysis

## 🛠️ Development Commands

### Backend
```bash
npm run dev     # Start development server with nodemon
npm start       # Start production server
```

### Frontend
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
```

## 🤝 Contributing

This is a comprehensive MERN stack project showcasing:
- Full-stack development with modern technologies
- Role-based authentication and authorization
- Real-time data management
- PDF and Excel report generation
- Email notification system
- Responsive UI with Tailwind CSS

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👥 Support

For issues and questions, please create an issue in the repository.

## 🎯 Future Enhancements

- Real-time notifications using WebSockets
- Advanced analytics with charts and graphs
- Bulk import/export of users and questions
- Question bank management
- Multiple test formats (essay, fill-in-blank)
- Mobile application
- Integration with learning management systems

---

**Built with ❤️ using the MERN Stack**
