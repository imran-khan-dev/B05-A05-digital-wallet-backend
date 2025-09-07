# 💼 Digital Wallet System Backend

A secure and role-based digital wallet system API built with Node.js, Express.js, TypeScript, MongoDB, and Zod. Supports multiple roles including **User**, **Agent**, and **Admin** with operations such as send money, withdraw, cash-in, and complete transaction tracking.

---

## 🚀 Features

- Role-based authentication (User, Agent, Admin)
- Add money to wallet (Agent)
- Withdraw and send money (User)
- Full transaction history (with pagination and filters)
- Admin control for Users, Agents, Wallets, Transactions
- Input validation using Zod

---

## 📦 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT, bcrypt
- **Validation:** Zod
- **Error Handling:** Custom Error Classes + Global Middleware

---

## 📂 Project Structure

src/
├── app/
│ ├── config/
│ ├── errorHelpers/
│ ├── helpers/
│ ├── interface/
│ ├── middlewares/
│ ├── modules/
│ ├── routes/
│ └── utils/
├── app.ts
└── server.ts

---

## 📑 API Endpoints

### 🧑‍💼 User & Agent Registration

**POST** `/api/v1/user/register`

#### ➤ For User:

json
{
"name": "John Doe",
"email": "john@example.com",
"phone": "017XXXXXXXX",
"password": "securePassword"
}

#### ➤ For Agent:

json
{
"name": "Agent Smith",
"email": "agent@example.com",
"phone": "018XXXXXXXX",
"role": "AGENT",
"password": "securePassword"
}

#### ➤ For Admin:

json
{
"name": "Agent Smith",
"email": "agent@example.com",
"phone": "018XXXXXXXX",
"role": "ADMIN",
"password": "securePassword"
}

---

### 🔐 Authentication

**POST** `/api/v1/auth/login`

json
{
"email": "user@example.com",
"password": "securePassword"
}

**POST** `/api/v1/auth/logout`

---

### 💰 Wallet Operations

#### ➤ Add Money (Agent Only)

**POST** `/api/v1/wallet/add-money`

json
{
"userId": "sampleuser@gmail.com", (email or phone)
"amount": 350
}

#### ➤ Withdraw Money (User Only)

**POST** `/api/v1/wallet/withdraw-money`

json
{
"agentID": "someoneagent@gmail.com", (email or phone)
"amount": 50
}

#### ➤ Send Money to Another User

**POST** `/api/v1/wallet/send-money`

json
{
"receiver": "someone@gmail.com", (email or phone)
"amount": 44
}

---

### 📄 Transaction History

#### ➤ For Users:

**GET** `/api/v1/transaction/transaction-history/:id?page=1&limit=10`

#### ➤ For Admin:

**GET** `/api/v1/transaction/transaction-history`

---

### 👥 User & Agent Management (Admin Only)

#### ➤ All Users:

**GET** `/api/v1/user/all-users`

#### ➤ All Agents:

**GET** `/api/v1/user/all-agents`

#### ➤ Update Agent Status:

**PATCH** `/api/v1/user/agent/update/:id`

json
{
"isApproved": true,
"isActive": "ACTIVE" // or "BLOCKED"
}

---

### 💼 Wallet Management (Admin Only)

#### ➤ View All Wallets:

**GET** `/api/v1/wallet/all-wallets`

#### ➤ Update Wallet Status:

**PATCH** `/api/v1/wallet/update-wallet/:userId`

json
{
"status": "ACTIVE" // or "BLOCKED"
}

---

## ✅ Testing

Test all endpoints using **Postman** or **Thunder Client**:

- Use JWT token in headers for protected routes

---

## 🔐 Environment Variables

DB_URL=
NODE_ENV =development

### JWT

JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES=

### BCRYPT

BCRYPT_SALT_ROUND=

### Admin

ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_PHONE=

### Express Session

EXPRESS_SESSION_SECRET=

### Frontend URL

FRONTEND_URL=

---

## 📄 License

MIT License.
