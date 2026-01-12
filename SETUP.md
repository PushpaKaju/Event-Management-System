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
KHALTI_SECRET_KEY=
KHALTI_INITIATE_URL=https://dev.khalti.com/api/v2/epayment/initiate/
KHALTI_LOOKUP_URL=https://dev.khalti.com/api/v2/epayment/lookup/
KHALTI_VERIFY_URL=https://khalti.com/api/v2/payment/verify/
ESEWA_MERCHANT_CODE=
NEXT_PUBLIC_ESEWA_MERCHANT_CODE=
NEXT_PUBLIC_ESEWA_CHECKOUT_URL=https://esewa.com.np/epay/main
ESEWA_VERIFY_URL=https://esewa.com.np/epay/transrec
```

### Payment gateways
Add the sandbox or live credentials for Khalti and eSewa here. The backend drives the Khalti redirect/verification flow so only the secret keys are required.

```env
KHALTI_SECRET_KEY=<your-khalti-secret-key>
KHALTI_INITIATE_URL=https://dev.khalti.com/api/v2/epayment/initiate/
KHALTI_LOOKUP_URL=https://dev.khalti.com/api/v2/epayment/lookup/
KHALTI_VERIFY_URL=https://a.khalti.com/api/v2/payment/verify/    # optional sandbox override
ESEWA_MERCHANT_CODE=<your-esewa-merchant-code>
NEXT_PUBLIC_ESEWA_MERCHANT_CODE=<your-esewa-merchant-code>
NEXT_PUBLIC_ESEWA_CHECKOUT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_VERIFY_URL=https://esewa.com.np/epay/transrec
ESEWA_SECRET_KEY=<your-esewa-secret-key>
```
Refer to the **Payment Gateway Integration** section below for more info.
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

## 💳 Payment Gateway Integration

This project has built-in Khalti and eSewa flows on the event detail page. Set the following values in `.env` before you accept payments:

| Key | Description |
| --- | --- |
| `KHALTI_SECRET_KEY` | Secret key from your Khalti merchant dashboard (used by the backend to call Khalti’s APIs). |
| `KHALTI_INITIATE_URL` | (Optional) Override for `https://dev.khalti.com/api/v2/epayment/initiate/` when using a custom environment. |
| `KHALTI_LOOKUP_URL` | (Optional) Override for `https://dev.khalti.com/api/v2/epayment/lookup/`. |
| `KHALTI_VERIFY_URL` | (Optional) Override for `https://khalti.com/api/v2/payment/verify/` (used by the legacy verification route). |
| `ESEWA_MERCHANT_CODE` | Merchant code assigned by eSewa (used by the backend verification endpoint). |
| `NEXT_PUBLIC_ESEWA_MERCHANT_CODE` | Same value again so the frontend can submit the payment form. |
| `NEXT_PUBLIC_ESEWA_CHECKOUT_URL` | Optional override if you want to test against a sandbox endpoint (defaults to `https://rc-epay.esewa.com.np/api/epay/main/v2/form`). |
| `ESEWA_VERIFY_URL` | The verification endpoint for eSewa (defaults to `https://esewa.com.np/epay/transrec`). |
| `ESEWA_STATUS_URL` | Optional URL for the transaction status check (defaults to `https://rc.esewa.com.np/api/epay/transaction/status/`). |
| `ESEWA_SECRET_KEY` | Secret used to generate the eSewa checkout signature. |

**Khalti workflow**:
1. Create a Khalti merchant account (https://khalti.com/signup) and add the sandbox or live `KHALTI_SECRET_KEY` to `.env`. You can also override `KHALTI_INITIATE_URL` / `KHALTI_LOOKUP_URL` if Khalti provides custom sandbox endpoints.
2. When a user clicks “Pay with Khalti”, the frontend posts to `/api/payments/khalti/initiate`. The backend converts the amount to paisa, forwards the request to Khalti, and returns the `payment_url`.
3. The browser is redirected in the same tab to Khalti’s payment portal. After the payment completes or fails, Khalti sends the user back to `/payments/khalti/success` or `/payments/khalti/failure`.
4. The success page calls `/api/payments/khalti/lookup` with the `pidx` returned by Khalti and only finalizes the registration if the status is `Completed`. The failure page stores the callback reason so the event page can show it immediately.
5. You may keep `KHALTI_VERIFY_URL` configured for compatibility with the legacy `/api/payments/khalti/verify` route, but the lookup/redirect flow is now the primary path.

> **Sandbox tip:** Use the test-mode keys provided by Khalti (they work with `https://dev.khalti.com/api/v2/epayment/initiate/` and `/lookup/`). Make sure the redirect URLs in the portal point to `http://localhost:3000/payments/khalti/success` and `/failure` while you are testing locally.

**eSewa workflow**:
1. Register for an eSewa merchant account (https://esewa.com.np/epay/merchant/) and note your merchant code.
2. When a user selects eSewa, the frontend builds a form that includes the signed payload generated by `/api/payments/esewa/checkout`. eSewa returns `transaction_uuid`/`total_amount` (and `ref_id`) in the callback query string.
3. The success page calls `/api/payments/esewa/status` to confirm the `status` (the backend will hit `ESEWA_STATUS_URL`) and writes the result into session storage so the event page can finalize the registration without additional user input.
4. The failure page surfaces the reason and lets the user return to the event.

> **Sandbox tip:** Keep pointing to `https://rc-epay.esewa.com.np/api/epay/main/v2/form` in development; the verification/status endpoints work the same way in sandbox.

## 🎯 Default Test Data

You can create test accounts:
- **User Account**: Any email with role "user"
- **Organizer Account**: Any email with role "organizer"

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

Feel free to fork and modify this project for your needs!
