#!/bin/bash
# Haven Institute Server Setup Script

cd ~/apps/Haveninstitute

# Generate passwords
DB_PASS=$(openssl rand -base64 24 | tr -d '\n')
REDIS_PASS=$(openssl rand -base64 24 | tr -d '\n')
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
JWT_REFRESH=$(openssl rand -base64 48 | tr -d '\n')

# Create main .env file
cat > .env << EOF
DOMAIN=havenstudy.com
ACME_EMAIL=admin@havenstudy.com
VITE_API_URL=https://api.havenstudy.com/api/v1
VITE_WS_URL=wss://api.havenstudy.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
DB_ROOT_PASSWORD=${DB_PASS}
DB_NAME=haven_institute
DB_USER=haven_user
DB_PASSWORD=${DB_PASS}
REDIS_PASSWORD=${REDIS_PASS}
TRAEFIK_AUTH=admin:placeholder
EOF

# Create backend .env.production file
cat > backend/.env.production << EOF
NODE_ENV=production
PORT=3001
API_VERSION=v1
CORS_ORIGIN=https://havenstudy.com

DB_HOST=mariadb
DB_PORT=3306
DB_NAME=haven_institute
DB_USER=haven_user
DB_PASSWORD=${DB_PASS}
DB_SSL=false

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=${JWT_REFRESH}
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=https://havenstudy.com
BCRYPT_ROUNDS=12
LOG_LEVEL=info
EOF

echo "Environment files created!"
echo "Starting Docker Compose..."

# Start deployment
docker compose up -d --build

echo "Deployment started! Checking status..."
sleep 10
docker compose ps
