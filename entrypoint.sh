#!/bin/sh

# filepath: /entrypoint.sh

echo "Starting entrypoint script..."

# Inject runtime environment variables into the Next.js static files
echo "Injecting runtime environment variables into static files..."

for file in $(find ./.next/static -type f -name "*.js"); do
  echo "Processing $file..."
  
  # Replace placeholders with actual environment variable values
  sed -i "s|NEXT_PUBLIC_API_URL_PLACEHOLDER|${NEXT_PUBLIC_API_URL}|g" "$file"
  sed -i "s|NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN_PLACEHOLDER|${NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}|g" "$file"
  sed -i "s|GOOGLE_CLIENT_ID_PLACEHOLDER|${GOOGLE_CLIENT_ID}|g" "$file"
  sed -i "s|GOOGLE_CLIENT_SECRET_PLACEHOLDER|${GOOGLE_CLIENT_SECRET}|g" "$file"
done

echo "Environment variables injected successfully."

# Start the application
exec "$@"