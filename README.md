# NexFeed

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<h1 align="center">NexFeed - Social Feed Platform</h1>

<p align="center">
A scalable and secure social feed platform built with modern web technologies.
</p>

<p align="center">
Frontend: Next.js + Redux Toolkit <br/>
Backend: NestJS + TypeORM <br/>
Database: PostgreSQL
</p>

---

# 🚀 Overview

NexFeed is a modern social feed platform where users can create posts, upload images, interact through comments and replies, and engage using like/unlike functionality.

The application is designed with scalability, security, and maintainability in mind using industry-standard architecture and best practices.

---

# ✨ Features

## Authentication & Authorization

- User Registration
- User Login
- JWT-based Authentication
- Protected Routes
- Password Hashing using bcrypt
- Secure Authorization Flow

---

## Feed System

- Create posts with text and image
- Public & Private posts
- Latest posts displayed first
- View all public posts from users
- Protected feed page

---

## Interaction Features

### Posts

- Like / Unlike posts
- View users who liked a post

### Comments

- Add comments to posts
- Like / Unlike comments
- View comment likes

### Replies

- Reply to comments
- Like / Unlike replies
- Nested interaction system

---

# 🧱 Technology Stack

## Frontend

- Next.js
- Redux Toolkit
- TypeScript
- Tailwind CSS

## Backend

- NestJS
- TypeORM

## Database

- PostgreSQL

---

# 📌 Why This Stack

## Next.js

- Fast performance
- Better routing system
- SEO-friendly architecture
- Scalable frontend structure

## Redux Toolkit

- Efficient global state management
- Easy authentication handling
- Optimized feed state management

## NestJS

- Enterprise-grade backend framework
- Clean and scalable architecture
- Modular development structure

## TypeORM

- Clean entity-based database modeling
- PostgreSQL integration
- Migration support

## PostgreSQL

- Reliable relational database
- Handles large-scale data efficiently
- Supports complex relationships

---

# 🏗️ Architecture Overview

## Authentication

- JWT Access Token
- Route protection using guards/middleware
- Password hashing with bcrypt

## Feed System

- Public & private posts
- Image upload support
- Comments & replies
- Like/unlike functionality
- Newest posts first

---

# 🗄️ Database Design

Main Entities:

- users
- posts
- comments
- replies
- likes

Relational mapping is optimized for scalability and maintainability.

---

# 🔐 Security Considerations

- Password hashing
- JWT validation
- Protected API routes
- DTO validation
- Secure database queries using TypeORM
- Authentication middleware & guards

---

# ⚡ Performance Considerations

- Feed pagination
- Optimized database queries
- Indexed database fields
- Efficient relational loading
- Scalable architecture for high-volume reads/writes

---

# 📂 Project Structure

```bash
src/
├── auth/
├── users/
├── posts/
├── comments/
├── replies/
├── likes/
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── decorators/
│   ├── dto/
│   └── utils/
├── config/
├── database/
└── main.ts
```

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
NODE_ENV=development
PORT=5000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=nexfeed

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

---

# 📦 Installation

```bash
# Install dependencies
bun install
```

---

# ▶️ Running the App

```bash
# Development
bun run start:dev

# Production
bun run build
bun run start:prod
```

---

# 📘 API Documentation

Swagger Documentation:

```bash
http://localhost:5000/api/v1/swagger
```

---

# 🧪 Testing

```bash
# Unit Tests
bun run test

# E2E Tests
bun run test:e2e

# Coverage
bun run test:cov
```

---

# 🌍 Deployment

The application can be deployed on:

- Vercel (Frontend)
- Railway
- Render
- DigitalOcean
- AWS
- Docker

---

# 📜 Best Practices Followed

- Clean Architecture
- DTO Validation
- Modular Structure
- Secure Authentication
- RESTful API Design
- Reusable Components
- Proper Error Handling
- Pagination & Filtering
- Scalable Database Design

---

# 👨‍💻 Author

## Zamirul Kabir

Software Engineer  
Next.js | NestJS | PostgreSQL | TypeScript

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.
