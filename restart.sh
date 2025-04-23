#!/bin/bash

# Stop all containers
docker-compose down

# Rebuild all containers
docker-compose build

# Start all containers
docker-compose up -d

echo "All containers rebuilt and restarted!"
echo "Frontend: http://localhost:3001"
echo "Backend: http://localhost:8001" 