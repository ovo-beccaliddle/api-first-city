#!/bin/bash

# Create assets directory if it doesn't exist
mkdir -p ./assets

# Check if the PostgreSQL JDBC driver already exists
if [ -f "./assets/postgresql-42.7.4.jar" ]; then
    echo "PostgreSQL JDBC driver already exists. Skipping download."
else
    # Download PostgreSQL JDBC driver
    echo "Downloading PostgreSQL JDBC driver..."
    curl -L https://jdbc.postgresql.org/download/postgresql-42.7.4.jar -o ./assets/postgresql-42.7.4.jar
    
    # Check if download was successful
    if [ $? -eq 0 ]; then
        echo "PostgreSQL JDBC driver downloaded successfully."
    else
        echo "Failed to download PostgreSQL JDBC driver!"
        exit 1
    fi
fi 