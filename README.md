# UPeer - University Peer Learning Platform

UPeer is a platform for university students to find study partners and form study groups based on courses they're enrolled in.

## Features

- User registration and authentication
- Course enrollment
- Creating help-seeking or help-offering posts
- Commenting on posts
- Creating and joining study groups
- Real-time messaging within study groups
- User profiles

## Tech Stack

- **Frontend**: React with Vite, TailwindCSS
- **Backend**: Django REST Framework
- **Database**: MySQL

## Running with Docker

The easiest way to run the application is using Docker Compose, which will set up all the necessary services (frontend, backend, and database) with a single command.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Steps to Run

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd UPeer
   ```

2. Start the application:
   ```bash
   docker-compose up
   ```

3. Access the application:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8001

4. Stop the application:
   ```bash
   docker-compose down
   ```

### Sample Accounts

The application comes with sample user accounts that you can use to test the features:

1. Admin User:
   - Email: admin@example.com
   - Password: password123

2. Regular User (John):
   - Email: john@example.com
   - Password: password123

3. Regular User (Jane):
   - Email: jane@example.com
   - Password: password123

## Development

### Frontend

- Navigate to the `frontend` directory
- Install dependencies: `npm install`
- Start development server: `npm run dev`

### Backend

- Navigate to the `backend` directory
- Create a virtual environment: `python -m venv venv`
- Activate the virtual environment:
  - Windows: `venv\Scripts\activate`
  - macOS/Linux: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`
- Start development server: `python manage.py runserver`

## License

This project is licensed under the MIT License.