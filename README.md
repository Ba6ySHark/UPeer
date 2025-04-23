# UPeer - Peer Learning and Study Group Platform

UPeer is a web application that allows students to find study partners, offer help, and create study groups based on their enrolled courses.

## Features

- **User Authentication**: Register, login, and profile management
- **Course Management**: Browse and enroll in courses
- **Help System**: Seek help or offer assistance to other students
- **Study Groups**: Create and join study groups
- **Messaging**: Real-time chat within study groups
- **Comments**: Comment on posts to interact with other students

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Django, Django REST Framework
- **Database**: MySQL
- **Deployment**: Docker, Docker Compose

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### First-time Setup

1. Clone the repository
   ```
   git clone <repository_url>
   cd UPeer
   ```

2. Run the setup script
   ```
   chmod +x setup.sh
   ./setup.sh
   ```

This will:
- Initialize the Docker containers
- Set up the database with sample data
- Start the application

3. Access the application
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8001

### Default Login Credentials

Three sample users are created during setup:

1. **Admin User**
   - Email: admin@example.com
   - Password: password123

2. **Regular User (John)**
   - Email: john@example.com
   - Password: password123

3. **Regular User (Jane)**
   - Email: jane@example.com
   - Password: password123

### When Setting Up on a New Device

When deploying on a new device, always run the `setup.sh` script to ensure the database is properly initialized.

## Troubleshooting

### Database Issues

If you encounter database-related errors (such as "Table doesn't exist"), try:

1. Reset the database:
   ```
   ./reset_db_docker.sh
   ```

2. If issues persist, you can perform a clean setup:
   ```
   docker-compose down -v
   ./setup.sh
   ```

### Connection Issues

If you see errors like `ERR_NAME_NOT_RESOLVED` or `ERR_CONNECTION_REFUSED`:

1. Make sure all containers are running:
   ```
   docker-compose ps
   ```

2. If any container is missing, restart all services:
   ```
   docker-compose up -d
   ```

3. Check if the backend URL is correctly configured in the frontend:
   - It should be `http://localhost:8001` when accessing from a browser

## Development

### Frontend Development

```
cd frontend
npm install
npm run dev
```

### Backend Development

```
cd backend
pip install -r requirements.txt
python manage.py runserver
```
