# Loan Management System 💳📂

A full-featured web-based Loan Management System built with **ASP.NET Core Web API** and **React.js**. This system is designed to manage users, roles, departments, loan contracts, archiving, and user permissions with real-time feedback and modern UI design.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based user authentication
- Role-based authorization (Admin, LoanUser, ArchiveUser, User)
- Secure password reset with temporary password modal
- User activation/deactivation via API

### 👤 User Management (Admin Panel)
- View, search, and filter users
- Assign roles and departments
- Inline user editing (username, email, role, department)
- Delete users with confirmation
- Reset user passwords with instant modal feedback

### 📂 Department Management
- View and manage department list
- Assign users to departments
- Fully integrated with user and contract logic

### 📄 Contract & Archive System
- Add, edit, and delete loan contracts
- Attach documents to each contract
- Archive module for storing scanned contracts and history

### 📦 Technologies Used

#### 🖥️ Frontend (React)
- React.js with Hooks
- Axios for API communication
- React Router for navigation
- SweetAlert2 for confirmation dialogs
- React Toastify for alerts
- Bootstrap & Custom CSS for responsive UI

#### ⚙️ Backend (ASP.NET Core)
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core with SQL Server
- Role & user management via Identity
- Custom endpoints for contracts, users, departments, roles
- Middleware for CORS, JWT validation, error handling

---

## 🧪 Example Admin Panel UI

- 👥 User list with actions: edit, reset password, change role/status/department
- 🛡️ Secure endpoints
- 🌐 Arabic and English UI support (customizable)

---

## 🗂 Folder Structure

```bash
LoanSystem/
├── Backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Data/
│   ├── Services/
│   └── Program.cs
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── Api/
│   │   └── Style/
│   └── public/
