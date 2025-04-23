#!/bin/bash

# Create necessary directories
mkdir -p db

# Ensure permissions are correct
chmod -R 755 .

echo "Setup complete. You can now run 'docker-compose up' to start the application." 