# Test Management System - Setup Guide

This guide will help you set up and run the Test Management System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v6.0 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas
   - Verify installation: `mongod --version`

3. **npm** (comes with Node.js) or **yarn**
   - Verify: `npm --version`

## Step-by-Step Setup

### 1. Clone or Download the Project

```bash
cd /workspace
```

### 2. Backend Setup

#### Install Backend Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Local MongoDB)
MONGODB_URI=mongodb://localhost:27017/test_management_system

# OR use MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/test_management_system

# JWT Secrets (Change these in production!)
JWT_SECRET=your-super-secret-jwt-key-12345
JWT_REFRESH_SECRET=your-refresh-secret-key-67890
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:5173

# Email Configuration (Optional - can configure from admin panel)
ADMIN_EMAIL=
ADMIN_EMAIL_PASSWORD=
EMAIL_SERVICE=gmail
```

#### Start MongoDB

If using local MongoDB:

```bash
# Start MongoDB service
# On macOS with Homebrew:
brew services start mongodb-community

# On Ubuntu:
sudo systemctl start mongod

# On Windows:
# MongoDB should start automatically, or start from Services
```

#### Start Backend Server

```bash
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### 3. Frontend Setup

Open a new terminal window/tab.

#### Install Frontend Dependencies

```bash
cd frontend
npm install
```

#### Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 4. Create Initial Admin User

Since this is a fresh installation, you need to create an admin user manually using MongoDB.

#### Option 1: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Create database: `test_management_system`
4. Create collection: `admins`
5. Insert document:

```json
{
  "email": "admin@test.com",
  "password": "$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUJ1Y/bqS2",
  "name": "System Administrator",
  "role": "admin",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

The password hash above is for: `Test@123`

#### Option 2: Using MongoDB Shell

```bash
mongosh

use test_management_system

db.admins.insertOne({
  email: "admin@test.com",
  password: "$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUJ1Y/bqS2",
  name: "System Administrator",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 5. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

Login with:
- **Email**: admin@test.com
- **Password**: Test@123

## Creating Test Users

### Create a Teacher Account

1. Login as Admin
2. Go to "Teachers" page
3. Click "Add Teacher"
4. Fill in the form:
   - Name: John Doe
   - Email: teacher@test.com
   - Password: Test@123
   - Employee ID: EMP001
5. Click "Create Teacher"

### Create a Student Account

1. Login as Admin
2. Go to "Students" page
3. Click "Add Student"
4. Fill in the form:
   - Name: Jane Smith
   - Email: student@test.com
   - Password: Test@123
   - Roll Number: STU001
   - Academic Year: 2024-2025

Note: You'll need to create Classes and Sections first before adding students.

## Troubleshooting

### Backend Issues

**Issue**: `MongoDB connection error`
**Solution**: 
- Ensure MongoDB is running: `mongod`
- Check if MongoDB URI in `.env` is correct
- For Atlas, ensure IP is whitelisted

**Issue**: `Port 5000 already in use`
**Solution**: 
- Change PORT in `.env` file
- Or kill the process: `lsof -ti:5000 | xargs kill`

**Issue**: `Module not found`
**Solution**: 
- Run `npm install` in backend directory
- Delete `node_modules` and `package-lock.json`, then reinstall

### Frontend Issues

**Issue**: `Failed to fetch`
**Solution**: 
- Ensure backend is running on port 5000
- Check proxy configuration in `vite.config.js`

**Issue**: `Port 5173 already in use`
**Solution**: 
- Vite will automatically use next available port
- Or specify port: `npm run dev -- --port 3000`

**Issue**: `Module not found`
**Solution**: 
- Run `npm install` in frontend directory
- Clear cache: `rm -rf node_modules .vite && npm install`

### Authentication Issues

**Issue**: `Invalid token` or constant logout
**Solution**: 
- Clear browser localStorage
- Check JWT_SECRET in backend `.env`
- Ensure system time is correct

## Production Deployment

### Backend Deployment

1. Update `.env` for production:
```env
NODE_ENV=production
MONGODB_URI=<production_mongodb_uri>
JWT_SECRET=<strong_random_secret>
CLIENT_URL=<production_frontend_url>
```

2. Build and start:
```bash
npm start
```

### Frontend Deployment

1. Build for production:
```bash
npm run build
```

2. The `dist` folder contains the production-ready files

3. Deploy to:
   - Vercel: `vercel deploy`
   - Netlify: Drag and drop `dist` folder
   - Traditional hosting: Upload `dist` folder contents

## Testing the Application

### Test Flow

1. **As Admin:**
   - Create subjects, classes, sections
   - Add teachers and students
   - Assign subjects to teachers

2. **As Teacher:**
   - Create a test
   - Add questions
   - Publish the test

3. **As Student:**
   - View available tests
   - Attempt test during scheduled time
   - Submit and view results

## Additional Configuration

### Email Setup (Optional)

To enable email notifications:

1. Login as Admin
2. Configure email settings in admin panel
3. For Gmail:
   - Enable "Less secure app access" OR
   - Use App Password (recommended)
   - Add credentials in admin settings

### Database Backup

Regular backups recommended:

```bash
# Backup
mongodump --db test_management_system --out ./backup

# Restore
mongorestore --db test_management_system ./backup/test_management_system
```

## Support

For issues or questions:
- Check the main README.md
- Review error logs in terminal
- Inspect browser console for frontend errors

---

**Happy Testing! 🚀**
