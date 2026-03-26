# 🍽️ FoodShare Platform

A full-stack web application designed to connect **food donors** with **receivers**, helping reduce food waste and support communities in need.

Built using **React (frontend)**, **Node.js/Express (backend)**, and **MongoDB (database)**, the platform includes features like real-time chat, notifications, ratings, favorites, and more.

---

## 🚀 Requirements

- Node.js (v16 or higher)
- MongoDB installed and running on `mongodb://localhost:27017`
- npm or yarn

---

## 📂 Project Structure

- `backend/` – Node.js Express server with API routes, database models, middleware, and file uploads  
- `frontend/` – React application built with Vite, using Tailwind CSS, React Router, and Socket.io  

---

## ⚙️ How to Run Locally

### 🔧 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file inside `backend/`:
   ```
   MONGO_URI=mongodb://localhost:27017/foodshare
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

Backend will run on:
```
http://localhost:5000
```

---

### 🌐 2. Frontend Setup

1. Navigate to the frontend directory:
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

Open in browser:
```
http://localhost:5173
```

---

## 🛠️ Troubleshooting

### 🔴 Backend Issues

- **Server not responding / connection refused**
  - Ensure backend is running (`npm run dev`)
  - Check terminal for errors

- **MongoDB connection error**
  - Ensure MongoDB is running at `mongodb://localhost:27017`

  On Windows:
  1. Open Command Prompt as Administrator  
  2. Start MongoDB:
     ```
     net start MongoDB
     ```
  3. Or run manually:
     ```
     "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"
     ```
  4. Verify connection:
     ```
     mongosh
     db.runCommand({ ping: 1 })
     ```

- **Environment variables not set**
  - Ensure `.env` exists in `backend/`
  - Check `MONGO_URI`, `JWT_SECRET`, `PORT`

- **Port already in use**
  - Change `PORT` in `.env` (e.g., 5001)

- **Dependencies missing**
  - Run:
    ```bash
    npm install
    ```

---

### 🔵 Frontend Issues

- **Failed to fetch / API errors**
  - Ensure backend is running
  - Verify correct API port

- **Build errors**
  - Run:
    ```bash
    npm install
    ```

- **Port conflicts**
  - Run frontend on another port:
    ```bash
    npm run dev -- --port 3000
    ```

---

### 💡 General Tips

- Check browser console and terminal logs  
- Ensure both frontend and backend are running  
- Restart servers after updating `.env`  

---

## ✨ Key Features

- 🔐 User Authentication & Authorization (JWT)
- 👥 Role-Based Access (Donor, Receiver, Admin, NGO)
- 💬 Real-time Chat (Socket.io)
- 🔔 Notification System
- ⭐ Ratings & Reviews
- ❤️ Favorites List
- 🔁 Recurring Donations
- 🧾 QR Code Generation for Donations
- 🖼️ Image Uploads
- 🏆 Leaderboard (Top Contributors)
- 🛠️ Admin Panel
- 📱 Responsive UI (Tailwind CSS)

---

## 📌 Conclusion

FoodShare Platform aims to bridge the gap between excess food and those in need, making food donation efficient, transparent, and accessible.
