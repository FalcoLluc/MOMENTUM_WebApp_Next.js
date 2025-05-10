#!/bin/sh
set -e

echo "Injecting runtime config..."

cat <<EOF > /app/public/runtime-config.js
window.__ENV__ = {
  NEXT_PUBLIC_API_URL: "${NEXT_PUBLIC_API_URL}",
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: "${NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}" 
};
EOF

exec "$@"