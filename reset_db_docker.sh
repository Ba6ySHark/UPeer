#!/bin/bash
set -e

echo "Resetting the database in Docker environment..."

# Stop current containers
echo "Stopping containers..."
docker-compose down

# Start the database container only
echo "Starting database container..."
docker-compose up -d db

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Connect to the MySQL container and reset the database
echo "Dropping and recreating database..."
docker-compose exec db bash -c "mysql -uroot -proot -e 'DROP DATABASE IF EXISTS myproject; CREATE DATABASE myproject;'"

# Import the schema
echo "Importing schema..."
docker-compose exec -T db bash -c "mysql -uroot -proot myproject" < backend/init_db.sql

# Start all containers
echo "Starting all containers..."
docker-compose up -d

echo "Database reset completed successfully!" 