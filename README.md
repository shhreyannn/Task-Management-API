# Task Management API

A production-ready RESTful API built with Node.js, Express, PostgreSQL, and MongoDB.

## Features

- **Authentication**: JWT based authentication.
- **Microservice-like DB split**: 
  - User details & Auth managed via **PostgreSQL**.
  - Task data managed via **MongoDB**.
- **Data Validation**: Request payloads are validated before processing (using `express-validator`).
- **Authorization**: Enforced Strict Ownership (Users can only access/modify their own tasks).
- **Security**: Security headers with Helmet, CORS enabled, password hashing via bcrypt.

## Tech Stack

- **Node.js** & **Express.js**
- **PostgreSQL** + **Sequelize** ORM (for Users)
- **MongoDB** + **Mongoose** (for Tasks)
- **JWT** (JSON Web Tokens)
- **bcrypt** for hashing

## Setup Instructions

### 1. Requirements
- Node.js (v14+ recommended)
- PostgreSQL running locally or remotely
- MongoDB running locally or remotely

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration
Copy the sample environment file and update the variables to match your local setup:
\`\`\`bash
cp .env.example .env
\`\`\`
Ensure `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `MONGO_URI` are correct.
*Note: Sequelize will try to automatically sync schemas, but make sure the PostgreSQL database name exists before running.*

### 4. Running the Project

**Development Mode (auto-restart)**
\`\`\`bash
npm run dev
\`\`\`

**Production Mode**
\`\`\`bash
npm start
\`\`\`

**Docker Support**
You can also run everything using docker-compose:
\`\`\`bash
docker-compose up --build
\`\`\`

## API Documentation / Example Requests

### Auth Endpoints

**1. Register User**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/register \\
-H "Content-Type: application/json" \\
-d '{"email":"user@example.com", "password":"password123"}'
\`\`\`

**2. Login User**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/login \\
-H "Content-Type: application/json" \\
-d '{"email":"user@example.com", "password":"password123"}'
\`\`\`
*(Returns a `token` to be used for authorized endpoints)*

**3. Get Profile**
\`\`\`bash
curl -X GET http://localhost:5000/api/auth/profile \\
-H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

### Task Endpoints
*(All task endpoints require the `Authorization: Bearer YOUR_JWT_TOKEN` header)*

**1. Create Task**
\`\`\`bash
curl -X POST http://localhost:5000/api/tasks \\
-H "Authorization: Bearer YOUR_JWT_TOKEN" \\
-H "Content-Type: application/json" \\
-d '{"title": "Buy groceries", "description": "Milk, Eggs, Bread"}'
\`\`\`

**2. Get All User Tasks**
\`\`\`bash
curl -X GET http://localhost:5000/api/tasks \\
-H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

**3. Get Single Task**
\`\`\`bash
curl -X GET http://localhost:5000/api/tasks/TASK_ID \\
-H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

**4. Update Task (Partial)**
\`\`\`bash
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID \\
-H "Authorization: Bearer YOUR_JWT_TOKEN" \\
-H "Content-Type: application/json" \\
-d '{"status": "completed"}'
\`\`\`

**5. Delete Task**
\`\`\`bash
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID \\
-H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`
