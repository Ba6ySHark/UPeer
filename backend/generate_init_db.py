#!/usr/bin/env python
import os
import environ
from pathlib import Path

# Initialize environment variables
env = environ.Env()

# Find the base directory to locate the .env file
BASE_DIR = Path(__file__).resolve().parent
env_file = os.path.join(BASE_DIR, '.env')

# Read .env file if it exists
if os.path.isfile(env_file):
    environ.Env.read_env(env_file)

# Get database settings from environment
DB_NAME = env.str('DB_NAME', default='myproject')
DB_USER = env.str('DB_USER', default='myproj_user')
DB_PASSWORD = env.str('DB_PASSWORD', default='s0m3‑str0ng‑p4ss')
DB_HOST = env.str('DB_HOST', default='127.0.0.1')
DB_PORT = env.str('DB_PORT', default='3306')

# Read the template SQL file
with open(os.path.join(BASE_DIR, 'init_db_template.sql'), 'r') as f:
    template_sql = f.read()

# Replace placeholders with actual values
sql_content = template_sql.replace('{{DB_NAME}}', DB_NAME)

# Write to the output file
with open(os.path.join(BASE_DIR, 'init_db.sql'), 'w') as f:
    f.write(sql_content)

print(f"Generated init_db.sql with database name: {DB_NAME}") 