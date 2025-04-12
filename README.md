# luxor_challenege Server
Shane Winn Luxor Challenge Submission

# Node.js Express Server

A simple Node.js Express server for managing users, collections, and bids with PostgreSQL. Supports user authentication, password reset via email, and CRUD operations.

## Overview
This server provides:
- User registration and login
- Password reset via email
- Management of collections and bids
- Secure data storage with PostgreSQL

## Dependencies
- `express`: Web framework for handling HTTP requests
- `pg`: PostgreSQL client for database interactions
- `bcrypt`: Password hashing for secure storage
- `jsonwebtoken`: JWT for user authentication
- `nodemailer`: Email sending for password resets
- `cors`: Enables cross-origin requests

## Prerequisites
- **Node.js**: v16 or later ([nodejs.org](https://nodejs.org/))
- **PostgreSQL**: Installed and running ([postgresql.org](https://www.postgresql.org/))
- **npm**: Included with Node.js
- **Git**: For cloning the repository

## Getting Started

### 1. Clone the Repository
Clone the project from the `luxor_server` branch:

```bash
git clone -b main https://github.com/your-username/your-repo-name.git
cd your-repo-name
