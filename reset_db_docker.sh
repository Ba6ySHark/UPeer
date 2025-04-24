#!/bin/bash
set -e

echo "Resetting the database in Docker environment..."

echo "Stopping containers..."
docker-compose down

echo "Starting database container..."
docker-compose up -d db

echo "Waiting for database to be ready..."
sleep 10

echo "Dropping and recreating database..."
docker-compose exec db bash -c "mysql -uroot -proot -e 'DROP DATABASE IF EXISTS myproject; CREATE DATABASE myproject;'"

echo "Importing schema..."
docker-compose exec -T db bash -c "mysql -uroot -proot myproject" < backend/init_db.sql

echo "Starting all containers..."
docker-compose up -d

echo "Database reset completed successfully!" 