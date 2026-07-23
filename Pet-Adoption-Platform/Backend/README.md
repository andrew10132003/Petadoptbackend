# 🐾 Pet Adoption Platform - Backend

REST API built with Node.js, Express.js, MongoDB, and Mongoose for the Pet Adoption Platform.

---

## 🚀 Features

- 🐶 Get All Pets
- 📄 Get Pet by ID
- 📝 User Registration
- 🏡 Adoption APIs
- 🔒 Password Hashing using bcrypt
- 🌍 MongoDB Atlas Database

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- bcryptjs
- dotenv
- cors

---

## 📂 Folder Structure

```
Backend
│
├── controllers
├── db.js
├── models
├── routes
├── server.js
├── .env
└── package.json
```

---

## ⚙️ Installation

Clone repository

```bash
git clone <repository-url>
```

Move to backend

```bash
cd Backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
```

Start the server

```bash
npm start
```

or

```bash
node server.js
```

---

## 📌 API Endpoints

### Pets

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/pets | Get all pets |
| GET | /api/pets/:id | Get pet details |

---

### Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Register User |

---

### Adoption

| Method | Endpoint |
|---------|----------|
| POST | /api/adoptions |

---

## Database

MongoDB Atlas

Collections

- pets
- users
- adoptions

---

## 👨‍💻 Developed By

**Andrew Cemon**
