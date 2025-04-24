FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create wait-for-db script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
host="$1"\n\
shift\n\
port="$1"\n\
shift\n\
cmd="$@"\n\
\n\
until nc -z "$host" "$port"; do\n\
  >&2 echo "Database is unavailable - sleeping"\n\
  sleep 1\n\
done\n\
\n\
>&2 echo "Database is up - executing command"\n\
exec $cmd' > /app/wait-for-db.sh \
    && chmod +x /app/wait-for-db.sh

# Copy project files
COPY . .

# Make debug script executable
RUN chmod +x /app/debug_start.sh

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application with debug script
CMD ["/app/wait-for-db.sh", "db", "3306", "/app/debug_start.sh"] 