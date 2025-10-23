# Test Management System - API Documentation

Complete API reference for the Test Management System backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "admin" | "teacher" | "student"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

### Refresh Token

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Profile

```http
GET /auth/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    ...
  }
}
```

### Update Profile

```http
PUT /auth/profile
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890"
}
```

### Change Password

```http
PUT /auth/change-password
```

**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

---

## Admin Endpoints

All admin endpoints require `role: admin` in JWT token.

### User Management

#### Create Teacher

```http
POST /admin/teachers
```

**Request Body:**
```json
{
  "email": "teacher@example.com",
  "password": "password123",
  "name": "Teacher Name",
  "employeeId": "EMP001",
  "phone": "+1234567890",
  "subjects": ["subject_id_1", "subject_id_2"],
  "sections": ["section_id_1"]
}
```

#### Create Student

```http
POST /admin/students
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "Student Name",
  "rollNumber": "STU001",
  "phone": "+1234567890",
  "parentPhone": "+0987654321",
  "class": "class_id",
  "section": "section_id",
  "academicYear": "2024-2025"
}
```

#### Get All Teachers

```http
GET /admin/teachers
```

#### Get All Students

```http
GET /admin/students?class=<class_id>&section=<section_id>&academicYear=2024-2025
```

#### Update User

```http
PUT /admin/users/:id?role=teacher|student
```

#### Delete User

```http
DELETE /admin/users/:id?role=teacher|student
```

### Class Management

#### Create Class

```http
POST /admin/classes
```

**Request Body:**
```json
{
  "name": "Grade 10",
  "grade": 10,
  "academicYear": "2024-2025"
}
```

#### Create Section

```http
POST /admin/sections
```

**Request Body:**
```json
{
  "name": "Section A",
  "class": "class_id",
  "academicYear": "2024-2025",
  "capacity": 40
}
```

#### Create Subject

```http
POST /admin/subjects
```

**Request Body:**
```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "description": "Advanced Mathematics"
}
```

### Request Management

#### Get Profile Change Requests

```http
GET /admin/requests/profile-changes?status=pending|approved|rejected
```

#### Approve Profile Change Request

```http
PUT /admin/requests/profile-changes/:id/approve
```

**Request Body:**
```json
{
  "comments": "Approved by admin"
}
```

#### Reject Profile Change Request

```http
PUT /admin/requests/profile-changes/:id/reject
```

#### Get Subject Assignment Requests

```http
GET /admin/requests/subject-assignments?status=pending
```

#### Approve Subject Assignment Request

```http
PUT /admin/requests/subject-assignments/:id/approve
```

---

## Teacher Endpoints

All teacher endpoints require `role: teacher` in JWT token.

### Test Management

#### Create Test

```http
POST /teacher/tests
```

**Request Body:**
```json
{
  "title": "Mid-term Exam",
  "description": "Mathematics mid-term examination",
  "subject": "subject_id",
  "class": "class_id",
  "section": "section_id",
  "studentGroups": ["group_id_1"],
  "academicYear": "2024-2025",
  "scheduledDate": "2024-03-15",
  "startTime": "2024-03-15T10:00:00Z",
  "duration": 60,
  "totalMarks": 100,
  "passingMarks": 40,
  "visibility": "all" | "section" | "groups"
}
```

#### Get Teacher's Tests

```http
GET /teacher/tests
```

#### Get Test by ID

```http
GET /teacher/tests/:id
```

#### Update Test

```http
PUT /teacher/tests/:id
```

#### Delete Test

```http
DELETE /teacher/tests/:id
```

#### Publish Test

```http
PUT /teacher/tests/:id/publish
```

### Question Management

#### Add Question to Test

```http
POST /teacher/tests/:testId/questions
```

**Request Body:**
```json
{
  "questionText": "What is 2 + 2?",
  "questionType": "multiple-choice",
  "options": [
    { "optionText": "3", "optionLabel": "A" },
    { "optionText": "4", "optionLabel": "B" },
    { "optionText": "5", "optionLabel": "C" },
    { "optionText": "6", "optionLabel": "D" }
  ],
  "correctAnswer": "B",
  "marks": 5
}
```

#### Update Question

```http
PUT /teacher/questions/:id
```

#### Delete Question

```http
DELETE /teacher/questions/:id
```

### Student Groups

#### Create Student Group

```http
POST /teacher/groups
```

**Request Body:**
```json
{
  "name": "Remedial Group",
  "description": "Students who need extra help",
  "subject": "subject_id",
  "students": ["student_id_1", "student_id_2"],
  "class": "class_id",
  "section": "section_id",
  "academicYear": "2024-2025"
}
```

#### Get Teacher's Groups

```http
GET /teacher/groups
```

### Reports

#### Get Test Results

```http
GET /teacher/tests/:testId/results
```

**Response:**
```json
{
  "results": [
    {
      "_id": "result_id",
      "student": {
        "name": "Student Name",
        "rollNumber": "STU001"
      },
      "obtainedMarks": 85,
      "totalMarks": 100,
      "percentage": 85,
      "isPassed": true
    }
  ]
}
```

#### Generate Excel Report

```http
GET /teacher/tests/:testId/results/excel
```

Returns downloadable Excel file.

#### Request Subject Assignment

```http
POST /teacher/requests/subject-assignment
```

**Request Body:**
```json
{
  "subject": "subject_id",
  "sections": ["section_id_1"],
  "reason": "I have expertise in this subject"
}
```

---

## Student Endpoints

All student endpoints require `role: student` in JWT token.

### Test Access

#### Get Available Tests

```http
GET /student/tests
```

**Response:**
```json
{
  "tests": [
    {
      "_id": "test_id",
      "title": "Mid-term Exam",
      "subject": { "name": "Mathematics" },
      "scheduledDate": "2024-03-15T10:00:00Z",
      "duration": 60,
      "totalMarks": 100,
      "isActive": true
    }
  ]
}
```

#### Get Test for Attempt

```http
GET /student/tests/:testId
```

Returns test with questions (without correct answers).

#### Start Test

```http
POST /student/tests/:testId/start
```

**Response:**
```json
{
  "message": "Test started successfully",
  "result": {
    "_id": "result_id",
    "test": "test_id",
    "status": "in-progress",
    "startedAt": "2024-03-15T10:05:00Z"
  }
}
```

#### Submit Test

```http
POST /student/tests/:testId/submit
```

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "question_id_1",
      "selectedAnswer": "B"
    },
    {
      "questionId": "question_id_2",
      "selectedAnswer": "A"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Test submitted successfully",
  "result": {
    "obtainedMarks": 85,
    "totalMarks": 100,
    "percentage": 85,
    "isPassed": true,
    "status": "submitted"
  }
}
```

### Results

#### Get Student Results

```http
GET /student/results
```

#### Get Result by ID

```http
GET /student/results/:resultId
```

#### Download Result PDF

```http
GET /student/results/:resultId/download
```

Returns downloadable PDF file.

### Analytics

#### Get Performance Analytics

```http
GET /student/analytics
```

**Response:**
```json
{
  "analytics": {
    "totalTests": 10,
    "passedTests": 8,
    "failedTests": 2,
    "averagePercentage": "78.50",
    "subjectWise": {
      "Mathematics": {
        "total": 5,
        "passed": 4,
        "avgPercentage": 75.5
      }
    },
    "recentResults": [...]
  }
}
```

### Profile Requests

#### Request Profile Change

```http
POST /student/requests/profile-change
```

**Request Body:**
```json
{
  "changes": {
    "phone": "+1234567890",
    "parentPhone": "+0987654321"
  },
  "reason": "Changed phone number"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": ["Email is required", "Password must be at least 6 characters"]
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

API endpoints are rate-limited to:
- **100 requests per 15 minutes** per IP address

Exceeded limits return:
```json
{
  "message": "Too many requests, please try again later"
}
```

---

## Pagination

For endpoints returning lists, use query parameters:

```
?page=1&limit=10&sort=-createdAt
```

---

**For more information, refer to the main README.md**
