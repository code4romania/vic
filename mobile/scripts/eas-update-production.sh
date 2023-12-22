#!/bin/bash

# Check if .env file exists
if [ -f .env ]; then
    # Prompt user for input
    read -p "Enter your EAS UPDATE message: " user_input

    # Execute the command with user input
    dotenv -e .env.production -- eas update --branch production --message "$user_input"
else
    echo "The .env file does not exist. Please create the .env file first."
fi
