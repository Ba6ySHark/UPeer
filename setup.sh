#!/bin/bash

echo "Setting up UPeer application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker before continuing."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose before continuing."
    exit 1
fi

# Give execution permission to scripts
chmod +x backend/debug_start.sh
chmod +x backend/wait-for-db.sh
chmod +x reset_db_docker.sh

# Make sure no containers are running
echo "Stopping any existing containers..."
docker-compose down

# Remove any existing volumes to ensure fresh start
echo "Removing existing volumes..."
docker volume rm upeer_mysql_data 2>/dev/null || true

# Build and start the containers
echo "Building and starting containers..."
docker-compose up -d

echo "Setup complete! The application should be accessible at:"
echo "Frontend: http://localhost:3001"
echo "Backend API: http://localhost:8001"
echo ""
echo "Default login credentials:"
echo "Admin: admin@example.com / password123"
echo "User: john@example.com / password123"
echo "User: jane@example.com / password123" 