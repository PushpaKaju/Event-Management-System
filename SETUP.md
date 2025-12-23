# Event Management System - Setup Guide

A full-stack event management application built with React (Next.js), Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: Sign up, login, and JWT-based authentication
- **Event Management**: Create, browse, and manage events
- **Event Registration**: Users can register for events
- **Dashboard**: View created events and registered events
- **Role-based Access**: Users, Organizers, and Admins
- **Search & Filter**: Find events by category and keywords
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB

#### Option A: Local MongoDB
- Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
- Start MongoDB service:
  ```bash
  # Windows (run as Administrator)
  net start MongoDB
  ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Update the `.env` file with your connection string

### 3. Configure Environment Variables

The `.env` file is already created with default values:

```env
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a secure random string in production!

If using MongoDB Atlas, update `MONGODB_URI` to your Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management?retryWrites=true&w=majority
```

### 4. Run the Application

#### Start Backend Server (Terminal 1)
```bash
npm run server
```

The backend API will run on `http://localhost:5000`

#### Start Frontend (Terminal 2)
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run dev
```

The frontend will run on `http://localhost:3000`

#### Or Run Both Together
```bash
npm run dev:all
```

## 📱 How to Use

### 1. Register an Account
- Visit `http://localhost:3000`
- Click "Get Started" or "Sign Up"
- Choose account type:
  - **User**: Can browse and register for events
  - **Organizer**: Can create and manage events

### 2. Browse Events
- Click "Events" in the header
- Use search and filters to find events
- Click on any event to view details

### 3. Create an Event (Organizers Only)
- Login as an organizer
- Go to Dashboard
- Click "Create New Event"
- Fill in event details and submit

### 4. Register for Events
- Browse events
- Click on an event
- Click "Register" button
- View your registrations in Dashboard

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (auth required)
- `PUT /api/events/:id` - Update event (auth required)
- `DELETE /api/events/:id` - Delete event (auth required)
- `POST /api/events/:id/register` - Register for event (auth required)
- `DELETE /api/events/:id/register` - Cancel registration (auth required)

### Users
- `GET /api/users/profile` - Get user profile (auth required)
- `PUT /api/users/profile` - Update profile (auth required)

## 📁 Project Structure

```
event-management-system/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   └── server.js        # Express server
├── src/
│   ├── app/            # Next.js pages
│   │   ├── login/      # Login page
│   │   ├── signup/     # Signup page
│   │   ├── events/     # Events listing
│   │   ├── dashboard/  # User dashboard
│   │   └── page.js     # Homepage
│   ├── component/      # React components
│   └── lib/           # Utility functions & API
├── .env               # Environment variables
└── package.json       # Dependencies
```

## 🎨 Tech Stack

**Frontend:**
- Next.js 15
- React 19
- TailwindCSS 4
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 🔧 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check if the connection string in `.env` is correct
- For Atlas, ensure your IP is whitelisted

### PowerShell Script Execution Error
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Port Already in Use
- Change `PORT` in `.env` for backend
- Frontend port can be changed with `-p` flag: `npm run dev -- -p 3001`

### Module Not Found
```bash
npm install
```

## 🎯 Default Test Data

You can create test accounts:
- **User Account**: Any email with role "user"
- **Organizer Account**: Any email with role "organizer"

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

Feel free to fork and modify this project for your needs!
