
# 🏗️ SiteLog Enterprise

### Construction Management and Expenditure Tracking System

SiteLog Enterprise is a full-stack web application developed using the MERN stack to simplify construction activity management, expenditure monitoring, budget planning and reporting.

## 🌐 Live Application

https://sitelog-mern-project.vercel.app

## Key Features

- User registration and authentication
- JWT-based authentication
- Role-based access control
- Administrator and contributor accounts
- Complete CRUD operations
- Construction activity management
- Real-time expenditure calculations
- Category-wise expenditure visualization
- Interactive donut charts
- Personal budget planning and utilization tracking
- Search, category filtering and sorting
- CSV report export
- Printable PDF reports
- Dark and light mode
- Responsive user interface

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React.js |
| Backend | Node.js and Express.js |
| Database | MongoDB |
| Authentication | JSON Web Token |
| Password Hashing | bcryptjs |
| API Communication | Axios |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## System Architecture

User → React Frontend → Express REST API → MongoDB

The React frontend communicates with the backend through REST APIs. The backend handles authentication, authorization, validation and database operations.

## User Roles

### Administrator

- View construction records
- Add construction records
- Edit existing records
- Delete records
- View expenditure analytics
- Generate reports

### Contributor

- Register and log in
- View construction records
- Add new records
- Search and filter activities
- View analytics
- Generate reports

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/signup | User registration |
| POST | /api/auth/login | User authentication |
| GET | /api/auth/me | Verify user identity and role |
| GET | /api/logs | Retrieve records |
| POST | /api/logs | Create record |
| PUT | /api/logs/:id | Update record |
| DELETE | /api/logs/:id | Delete record |

Update and delete operations require administrator authorization.

## Project Structure

    sitelog-app/
    ├── frontend/
    │   ├── src/
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   ├── index.html
    │   └── package.json
    └── backend/
        ├── server.js
        └── package.json

## Security Features

- Password hashing using bcrypt
- JWT authentication
- Server-side administrator authorization
- Protected API endpoints
- Server-side input validation
- Environment-based secret management

## Environment Variables

The backend requires:

- MONGO_URI
- JWT_SECRET
- ADMIN_USERNAME

Sensitive credentials are managed through environment variables and must not be committed to the repository.

## Current Limitations

- Personal budgets are stored locally in the browser.
- The application currently uses a shared project workspace.
- The free hosting service may experience cold-start delays.

## Future Scope

- Multiple construction project management
- Cloud-synchronized project budgets
- Construction photograph uploads
- Advanced financial reporting
- Project scheduling and progress tracking
- User activity audit logs

## Conclusion

SiteLog Enterprise demonstrates the practical implementation of full-stack web development, REST APIs, database management, authentication, authorization and responsive interface design.

Developed as an academic MERN stack project.
