# FitSync — Fitness Center Management System

A production-grade, full-stack **MERN (MongoDB, Express.js, React.js with Vite, Node.js)** web application built for gym owners, administrators, and trainers to manage gym operations, member profiles, subscriptions, trainer schedules, real-time check-in/out attendance, and customized workout routines.

---

## 🌟 Key Features

### 1. Member Management
- Complete CRUD: Register members, view member directory, edit member details, and delete members with cascading data cleanup.
- Real-time search by name, phone, or email, with status filtering (Active, Inactive, Suspended).
- Displays active subscription tier and assigned personal trainer.
- 1-click Quick Check-In directly from the member list.

### 2. Membership Plans & Subscriptions
- Multi-tier plan configuration (Basic, Quarterly, Semi-Annual, Elite VIP).
- Dynamic pricing, duration calculation, and amenity bullets.
- Subscription tracking with automated expiry calculations and payment status (UPI, Cash, Cards).

### 3. Trainer Management & Scheduling
- Certified coach registry with experience years, hourly rates, bios, and specializations.
- Weekly scheduling matrix organized by day of week, start/end time slots, and capacity limits.
- Session categorization: Personal Training, Group Bootcamp, Floor Duty, and Consultations.

### 4. Real-Time Attendance Management
- Real-time **Check-In** and **Check-Out** timestamps.
- JWT-authenticated attendance API endpoints.
- Daily attendance logs with active in-session counters and date-picker history.

### 5. Workout Program Management
- Interactive routine builder with multi-day splits (e.g. Upper/Lower, Push/Pull/Legs).
- Exercise details including target sets, rep ranges, and coaching cues.
- Assignment to members and trainers with goal tracking (Muscle Gain, Fat Loss, Endurance, Flexibility).

### 6. Centralized Analytics Dashboard
- Live KPI summary: Total Members, Active Members, Trainers on Roster, Inside Gym Now, Active Plans, and Subscription Revenue.
- Real-time attendance feed with instant checkout actions.
- Popular plan breakdown and revenue share metrics.

### 7. Security & Authentication
- JSON Web Token (JWT) stateless authentication.
- Password hashing using `bcryptjs` with salt rounds.
- Role-Based Access Control (Admin, Trainer, Member).
- Automatic JWT Bearer token injection on all client API requests.

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React.js (Vite) | React 19, Vite 8 |
| **Styling** | Tailwind CSS v4, Lucide React Icons | Modern Dark Mode UI |
| **Backend** | Node.js & Express.js | Node 24, Express 5 |
| **Database** | MongoDB & Mongoose ODM | MongoDB 8.3, Mongoose 9 |
| **Authentication** | JWT & Bcrypt.js | 30-day token lifetime |
| **Client HTTP** | Axios | Request & Response Interceptors |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Database Seeding
Populate the database with realistic sample members, trainers, plans, schedules, attendance logs, and workout routines:
```bash
cd backend
npm run seed
```

### 2. Start the Backend API Server
```bash
cd backend
npm start
# Server starts at http://localhost:5000
```

### 3. Start the Frontend Client
In a new terminal window:
```bash
cd frontend
npm run dev
# Vite client runs at http://localhost:5173
```

---

## 🔐 Default Demo Credentials

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@fitsync.com` | `admin123password` |

*(A convenient "Use Demo Admin Credentials" button is also provided on the login page for rapid evaluation)*

---

## 🧪 Automated Testing

Run the full automated test suite verifying all 15 endpoints:
```bash
cd backend
npm test
```
Verifies:
1. Health check endpoint (`/api/health`)
2. Invalid password rejection (401)
3. Admin JWT login and token generation
4. Dashboard KPI aggregation
5. Member CRUD (List, Create, Edit/Update, Delete)
6. Plan and Subscription lifecycles
7. Trainer and Schedule creation
8. Attendance Check-In and Check-Out with JWT headers
9. Workout Plan creation and assignment with JWT headers

