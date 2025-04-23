#!/usr/bin/env python
import os
import sys

# Database credentials
DB_NAME = "myproject"
DB_USER = "myproj_user"
DB_PASS = "s0m3‑str0ng‑p4ss"
DB_HOST = "localhost"
DB_PORT = "3306"

# Create the commands to run
drop_cmd = f"mysql -h{DB_HOST} -P{DB_PORT} -u{DB_USER} -p{DB_PASS} -e 'DROP DATABASE IF EXISTS {DB_NAME}; CREATE DATABASE {DB_NAME};'"
import_cmd = f"mysql -h{DB_HOST} -P{DB_PORT} -u{DB_USER} -p{DB_PASS} {DB_NAME} < init_db.sql"
migrate_cmd = "python3 manage.py migrate"

# Execute commands
print("Dropping and recreating database...")
drop_result = os.system(drop_cmd)
if drop_result != 0:
    print("Failed to drop and recreate database!")
    sys.exit(1)

print("Importing schema from init_db.sql...")
import_result = os.system(import_cmd)
if import_result != 0:
    print("Failed to import schema!")
    sys.exit(1)

print("Running Django migrations...")
migrate_result = os.system(migrate_cmd)
if migrate_result != 0:
    print("Failed to run migrations!")
    sys.exit(1)

print("Database reset completed successfully!") 