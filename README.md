# 🚀 Financial Management Backend

A production-ready, secure, and performant backend system for financial management. Built with **Node.js**, **Express**, and **PostgreSQL**, this API provides robust authentication, granular Role-Based Access Control (RBAC), and real-time dashboard analytics.

---

## 🌐 Live Demo & API Documentation

The production environment is hosted on **Railway**:
👉 **[Live API Documentation](https://zorvyn-screening-production.up.railway.app/api-docs/)**

---

## 🏗️ System Architecture

Our system follows the **Repository Pattern** and a clean service-oriented architecture to facilitate testability and separation of concerns.

```mermaid
graph TD
    User((Client / Frontend)) --> WebAPI[Express API Entry]
    
    subgraph Middleware
        Auth[JWT Auth Middleware]
        Role[RBAC Middleware]
        Rate[Rate Limiter]
        Val[Joi Validation]
    end
    
    WebAPI --> Auth
    Auth --> Role
    Role --> Rate
    Rate --> Val
    
    subgraph Controllers
        AuthCtrl[Auth Controller]
        RecCtrl[Record Controller]
        DashCtrl[Dashboard Controller]
    end
    
    Val --> AuthCtrl
    Val --> RecCtrl
    Val --> DashCtrl
    
    subgraph Services
        AuthServ[Auth Service]
        RecServ[Record Service]
        DashServ[Dashboard Service]
    end
    
    AuthCtrl --> AuthServ
    RecCtrl --> RecServ
    DashCtrl --> DashServ
    
    subgraph Repositories
        UserRepo[User Repository]
        RecordRepo[Record Repository]
    end
    
    AuthServ --> UserRepo
    RecServ --> RecordRepo
    DashServ --> DB[(PostgreSQL)]
    
    UserRepo --> DB
    RecordRepo --> DB
```

---

## ✨ Features

- **🔐 Secure Authentication**: JWT-based authentication using `bcrypt` for password hashing and normalization.
- **🛡️ Granular RBAC**: Role-based access for `ADMIN`, `ANALYST`, and `VIEWER`.
- **📊 Financial Analytics**: Real-time aggregation of income, expenses, trends, and category Distribution.
- **📑 Record Ownership**: Advanced ownership validation ensuring users only manage their own data.
- **🛡️ Brute-Force Protection**: Tiered rate-limiting for login/registration (10/hr) and general API (100/15min).
- **📝 Swagger Documentation**: Full interactive API documentation with standardized production schemas.
- **✅ Robust Test Suite**: 57+ tests achieving high coverage across unit, integration, and RBAC layers.

---

## 💾 Database Schema

```mermaid
erDiagram
    USERS ||--o{ RECORDS : "owns"
    USERS {
        int id PK
        string username "Unique"
        string email "Unique, Lowercase"
        string password "Hashed"
        string role "ADMIN, ANALYST, VIEWER"
        string status "ACTIVE, INACTIVE"
        timestamp created_at
    }
    RECORDS {
        int id PK
        float amount
        string type "income, expense"
        string category
        string description
        int user_id FK
        timestamp date
        timestamp updated_at
    }
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Security**: Helmet, CORS, Express-Rate-Limit, JWT, Bcrypt
- **Validation**: Joi
- **Documentation**: Swagger UI
- **Testing**: Jest, Supertest

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (latest LTS)
- [PostgreSQL](https://www.postgresql.org/)

### 2. Installation
```bash
git clone https://github.com/your-username/zorvyn.git
cd zorvyn
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=3000
DB_URL=postgresql://user:password@localhost:5432/finance_db
JWT_SECRET=your_super_secret_key_here
```

### 4. Database Initialization
The system automatically initializes tables on startup via `db/init.js`. To manually run the local migration:
```bash
node db/init.js
```

### 5. Running the Application
```bash
# Development
npm run start

# API Documentation
# Visit http://localhost:3000/api-docs in your browser
```

---

## 🧪 Testing

We use a comprehensive suite of unit and integration tests.

```bash
# Run all 57 tests
npm test

# Run specific test suite
npm test tests/integration/integrated.test.js
```

---

## 📖 API Reference

Detailed documentation is available at `/api-docs`.

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | User registration | All |
| `/api/auth/login` | `POST` | Get JWT access token | All |
| `/api/records` | `GET` | List/Filter records | Admin, Analyst |
| `/api/records` | `POST` | Create record | Admin |
| `/api/dashboard/summary` | `GET` | Aggregated analytics | All |
| `/api/users` | `GET` | Management list | Admin |

---

## 🛡️ Security Best Practices
- **Helmet**: Headers protection.
- **CORS**: Domain restriction.
- **Rate Limit**: API Flood protection.
- **Error Middleware**: Centralized and sanitized error reporting.
- **Input Sanitization**: Joi schema enforcement.
