🐾 Pet Adoption Platform - Backend
Backend API for the Pet Adoption Platform.
Built using Node.js, Express.js, MongoDB, and JWT authentication.
🚀 Features
- 🔐 User Registration
- 🔑 User Login
- 🔒 JWT Authentication
- 👥 Role-based Authentication
- 🐶 Pet Management
- 📋 Adoption Applications
- 👑 Admin Dashboard APIs
- ✅ Approve Adoption Requests
- ❌ Reject Adoption Requests
- 🔐 Protected API Routes
- 🗄️ MongoDB Database
- 🔑 Password Hashing with bcrypt
👥 User Roles
The application supports four user roles:
👑 Admin
Admin can:
- View all adoption requests
- Approve adoption requests
- Reject adoption requests
- Manage platform-level adoption activities
🏠 Shelter
Shelter users can access the platform as shelter users.
🐕 Adopter
Adopters can:
- Browse pets
- Submit adoption applications
- View adoption requests
- Track adoption status
🧑‍🍼 Foster
Foster users can access the platform as foster users.
🔐 Demo Credentials
🏠 Shelter
Email: `shelter@example.com`  
Password: `Shelter@123`  
Role: `shelter`
🐕 Adopter

Email:`adopter@example.com`  
Password: `Adopter@123`  
Role: `adopter`
🧑‍🍼 Foster
Email: `foster@example.com`  
Password: `Foster@123`  
Role: `foster`
👑 Admin
Use the existing Admin account created in the database.
Role: `admin`
> ⚠️ Demo credentials are provided for project evaluation and testing purposes.
🛠️ Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Axios
- dotenv
- CORS
---
 📂 Folder Structure
text
Backend
│
├── config
├── controllers
│   ├── adoptionController.js
│   ├── adminController.js
│   ├── authController.js
│   └── petController.js
│
├── middleware
│   ├── authMiddleware.js
│   └── adminMiddleware.js
│
├── models
│   ├── Adoption.js
│   ├── Pet.js
│   └── User.js
│
├── routes
│   ├── adoptionRoutes.js
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   └── petRoutes.js
│
├── db.js
├── seed.js
├── server.js
├── package.json
└── README.md
