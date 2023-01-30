#!/bin/bash

set -e

# Get the current version number of frontend project
FRONTEND_CURRENT_VERSION=$(grep '"version"' frontend/package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')

# Prompt the user for the new version number of frontend project
read -p "Enter the new version number for frontend project (current version: $FRONTEND_CURRENT_VERSION): " FRONTEND_NEW_VERSION

# Update the version number in frontend's package.json file
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i "" "s/$FRONTEND_CURRENT_VERSION/$FRONTEND_NEW_VERSION/g" frontend/package.json
else
  # Linux
  sed -i "s/$FRONTEND_CURRENT_VERSION/$FRONTEND_NEW_VERSION/g" frontend/package.json
fi

# Get the current version number of backend project
BACKEND_CURRENT_VERSION=$(grep '"version"' backend/package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')

# Prompt the user for the new version number of backend project
read -p "Enter the new version number for backend project (current version: $BACKEND_CURRENT_VERSION): " BACKEND_NEW_VERSION

# Update the version number in backend's package.json file
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i "" "s/$BACKEND_CURRENT_VERSION/$BACKEND_NEW_VERSION/g" backend/package.json
else
  # Linux
  sed -i "s/$BACKEND_CURRENT_VERSION/$BACKEND_NEW_VERSION/g" backend/package.json
fi

# Commit the changes
git add frontend/package.json backend/package.json
git commit -m "chore(versioning): bump version to $FRONTEND_NEW_VERSION (frontend) and $BACKEND_NEW_VERSION (backend)"

# Push the changes
git push