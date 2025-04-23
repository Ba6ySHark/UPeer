#!/bin/bash
set -e

echo "DEBUG: Starting debug script"
echo "DEBUG: PWD=$(pwd)"
echo "DEBUG: Contents of current directory:"
ls -la

echo "DEBUG: Checking Python and Django versions:"
python --version
python -c "import django; print(f'Django version: {django.__version__}')"

echo "DEBUG: Checking DB connection:"
python -c "import mysql.connector; print('MySQL connector imported successfully')"

echo "DEBUG: Trying migrations:"
python manage.py showmigrations

echo "DEBUG: Running the server:"
python manage.py runserver 0.0.0.0:8000 