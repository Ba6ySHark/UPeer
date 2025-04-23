# UPeer Backend

This is the backend for the UPeer application, a platform for university students to find study partners and form study groups.

## Technology Stack

- Django 5 with Django REST Framework
- MySQL 8.0 database
- Django Channels for WebSockets (real-time chat)
- JWT Authentication

## Setup Instructions

1. Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install the required packages:

```bash
pip install -r requirements.txt
```

3. Configure the `.env` file with your database settings and JWT secret key.

4. Initialize the database:

```bash
python init_db.py
```

5. Run the development server:

```bash
python manage.py runserver
```

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT token
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/` - Update user profile

### Courses

- `GET /api/courses/` - List all courses
- `POST /api/courses/` - Create a new course (admin only)
- `GET /api/courses/mine/` - List courses the user is enrolled in
- `POST /api/courses/enrol/` - Enroll in a course
- `DELETE /api/courses/enrol/{course_id}/` - Unenroll from a course

### Posts

- `GET /api/posts/` - List all posts (filter by course_id query parameter)
- `POST /api/posts/` - Create a new post
- `PUT /api/posts/{post_id}/` - Update a post
- `DELETE /api/posts/{post_id}/` - Delete a post
- `POST /api/posts/{post_id}/report/` - Report a post
- `GET /api/posts/reported/` - List reported posts (admin only)

### Study Groups

- `GET /api/groups/` - List all study groups the user is a member of
- `POST /api/groups/` - Create a new study group
- `GET /api/groups/{group_id}/` - Get a study group details
- `POST /api/groups/join/` - Join a study group
- `DELETE /api/groups/{group_id}/leave/` - Leave a study group

### Chat

- `GET /api/chat/{group_id}/messages/` - Get all messages in a study group
- `WS /ws/chat/{group_id}/?token={jwt_token}` - WebSocket connection for real-time chat 