#!/bin/bash

# Database credentials from Django settings
DB_USER="myproj_user"
DB_PASS="s0m3‑str0ng‑p4ss"
DB_HOST="localhost"
DB_PORT="3306"

echo "Adding post_type column to posts table..."

# Check if mysql client is available
if ! command -v mysql &> /dev/null; then
    echo "MySQL client not found. Please install MySQL client."
    exit 1
fi

# Execute SQL script to add column
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" < manual_init_db.sql

if [ $? -eq 0 ]; then
    echo "Column added successfully!"
else
    echo "Failed to add column!"
    exit 1
fi

echo "Done!" 