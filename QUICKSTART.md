# 🚀 Quick Start Guide

Get your Event Management System running in 3 simple steps!

## Step 1: Install MongoDB

### Option A - MongoDB Atlas (Recommended - Free Cloud Database)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy your connection string
5. Open `.env` file and update:
   ```
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/event-management
   ```

### Option B - Local MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. The `.env` file is already configured for local MongoDB

## Step 2: Start the Backend Server

Open **PowerShell Terminal 1** and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run server
```

✅ You should see: "✅ Connected to MongoDB" and "🚀 Server running on port 5000"

## Step 3: Start the Frontend

Open **PowerShell Terminal 2** and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run dev
```

✅ You should see: "▲ Next.js 15.x.x"

## 🎉 You're Ready!

Open your browser and visit: **http://localhost:3000**

---

## 📱 Try It Out

### 1. Create an Account
- Click **"Get Started"** or **"Sign Up"**
- Enter your details
- Choose **"Organize events"** if you want to create events

### 2. Browse Events
- Click **"Events"** in the header
- View all available events

### 3. Create Your First Event (For Organizers)
- Login as an organizer
- Go to **Dashboard**
- Click **"Create New Event"**
- Fill in the form and create!

### 4. Register for Events
- Browse events
- Click on any event
- Click **"Register"** button

---

## 🔧 Troubleshooting

### Can't run npm commands?
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### MongoDB connection error?
- Make sure MongoDB is running (if local)
- Check your connection string in `.env`
- For Atlas: whitelist your IP address in MongoDB Atlas dashboard

### Port already in use?
**Backend (port 5000):**
- Edit `.env` and change `PORT=5000` to another port like `PORT=5001`

**Frontend (port 3000):**
```powershell
npm run dev -- -p 3001
```

### Module not found errors?
```powershell
npm install
```

---

## 📚 What's Next?

Read the full [SETUP.md](SETUP.md) for detailed documentation including:
- All API endpoints
- Project structure
- Advanced configuration
- Deployment guide

---

## 🎯 Key Features to Try

✨ **User Authentication** - Secure login and registration  
✨ **Event Creation** - Create and manage events  
✨ **Event Registration** - Register for events  
✨ **Dashboard** - Track your events  
✨ **Search & Filter** - Find events easily  
✨ **Role-based Access** - Different permissions for users and organizers  

---

## 💡 Tips

- **Test Account**: Create 2 accounts - one as "user" and one as "organizer" to try all features
- **Sample Event**: Create a test event to see how everything works
- **Network Error?** Make sure both frontend and backend are running

---

## 🆘 Need Help?

Check the [SETUP.md](SETUP.md) file for more detailed troubleshooting and documentation.

Happy Event Planning! 🎊
