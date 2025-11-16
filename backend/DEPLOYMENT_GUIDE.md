# Haven Institute Backend - Deployment Guide

Complete guide for deploying the Haven Institute API to AWS, Hetzner, or any cloud provider.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Database Setup](#database-setup)
- [Production Deployment](#production-deployment)
  - [AWS Deployment](#aws-deployment)
  - [Hetzner Deployment](#hetzner-deployment)
  - [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Migrations](#database-migrations)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Software

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Docker** 24.x or higher (for containerized deployment)
- **MariaDB** 11.x or higher (or MySQL 8.x)

### Required Accounts

- Stripe account (for payments)
- OpenAI or Anthropic account (for AI chat, optional)
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)

---

## Local Development

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your local configuration:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/haven_institute"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI Providers (Optional)
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
```

### 3. Set Up Database

Install MariaDB locally or use Docker:

```bash
# Using Docker
docker run -d \
  --name haven_mariadb \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=haven_institute \
  -e MYSQL_USER=haven_user \
  -e MYSQL_PASSWORD=haven_password \
  -p 3306:3306 \
  mariadb:11.2
```

### 4. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3001`

Test health endpoint: `curl http://localhost:3001/health`

---

## Database Setup

### Creating the Database

```sql
-- Login to MariaDB as root
mysql -u root -p

-- Create database
CREATE DATABASE haven_institute CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'haven_user'@'%' IDENTIFIED BY 'strong_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON haven_institute.* TO 'haven_user'@'%';
FLUSH PRIVILEGES;
```

### Running Migrations

```bash
# Apply all pending migrations
npx prisma migrate deploy

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

---

## Production Deployment

### AWS Deployment

#### Option 1: EC2 + RDS

**1. Create RDS MariaDB Instance**

```bash
# Via AWS CLI
aws rds create-db-instance \
  --db-instance-identifier haven-db \
  --db-instance-class db.t3.micro \
  --engine mariadb \
  --master-username admin \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-name haven_institute \
  --backup-retention-period 7 \
  --multi-az
```

**2. Launch EC2 Instance**

```bash
# Create EC2 instance (Ubuntu 22.04 LTS)
aws ec2 run-instances \
  --image-id ami-xxxxx \
  --instance-type t3.small \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx
```

**3. SSH into EC2 and Set Up**

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker (optional)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/your-org/haven-institute.git
cd haven-institute/backend

# Install dependencies
npm ci --only=production

# Create .env file
nano .env
# Paste your production environment variables

# Build application
npm run build

# Run Prisma migrations
npx prisma migrate deploy

# Start with PM2
pm2 start dist/server.js --name haven-api
pm2 save
pm2 startup
```

**4. Configure Nginx Reverse Proxy**

```bash
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/haven-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Special handling for Stripe webhooks (raw body)
    location /api/v1/stripe/webhook {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10M;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/haven-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### Option 2: ECS + Fargate (Fully Managed)

**1. Build and Push Docker Image**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name haven-api

# Build image
docker build -t haven-api .

# Tag and push
docker tag haven-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/haven-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/haven-api:latest
```

**2. Create ECS Task Definition**

Create `task-definition.json`:

```json
{
  "family": "haven-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "haven-api",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/haven-api:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "3001" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:xxx:secret:haven/db-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/haven-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create ECS service
aws ecs create-service \
  --cluster haven-cluster \
  --service-name haven-api-service \
  --task-definition haven-api \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

---

### Hetzner Deployment

#### Option 1: Hetzner Cloud VM

**1. Create Server**

```bash
# Via Hetzner Cloud Console
# - Choose Ubuntu 22.04
# - Select CX21 or better (2 vCPU, 4GB RAM)
# - Add SSH key
# - Enable private networking

# Or via CLI
hcloud server create \
  --name haven-api \
  --type cx21 \
  --image ubuntu-22.04 \
  --ssh-key my-key \
  --location fsn1
```

**2. Set Up Server**

```bash
# SSH into server
ssh root@<server-ip>

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install -y docker-compose

# Create application directory
mkdir -p /opt/haven-api
cd /opt/haven-api

# Clone repository
git clone https://github.com/your-org/haven-institute.git .
cd backend

# Create .env file
nano .env
# Add production environment variables

# Build with Docker Compose
docker-compose up -d

# Or install PM2 and run directly
npm ci --only=production
npm run build
npm install -g pm2
pm2 start dist/server.js --name haven-api
pm2 save
pm2 startup
```

**3. Set Up Nginx**

Same as AWS EC2 Nginx configuration above.

**4. Configure Firewall**

```bash
# UFW firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

#### Option 2: Hetzner Managed Database

```bash
# Create managed MariaDB instance via Hetzner Cloud Console
# - Choose MariaDB 11.x
# - Select appropriate size
# - Enable backups

# Update DATABASE_URL in .env
DATABASE_URL="mysql://user:password@<db-host>:3306/haven_institute"
```

---

### Docker Deployment (Any Provider)

**1. Using Docker Compose**

```bash
# Clone repository
git clone https://github.com/your-org/haven-institute.git
cd haven-institute/backend

# Create .env file
cp .env.example .env
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

**2. Using Docker Only**

```bash
# Build image
docker build -t haven-api .

# Run MariaDB
docker run -d \
  --name haven_db \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=haven_institute \
  -e MYSQL_USER=haven_user \
  -e MYSQL_PASSWORD=haven_password \
  -p 3306:3306 \
  mariadb:11.2

# Run API
docker run -d \
  --name haven_api \
  --link haven_db:database \
  -p 3001:3001 \
  -e DATABASE_URL="mysql://haven_user:haven_password@database:3306/haven_institute" \
  -e JWT_SECRET="your-secret" \
  -e NODE_ENV=production \
  haven-api

# Run migrations
docker exec haven_api npx prisma migrate deploy
```

---

## Environment Configuration

### Production Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/haven_institute

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=<generate-strong-secret-with-openssl-rand-base64-32>
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI (Optional)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

### Generating Secrets

```bash
# Generate strong JWT secret
openssl rand -base64 32

# Generate random password
openssl rand -hex 16
```

---

## Database Migrations

### Production Migration Strategy

```bash
# 1. Backup database before migration
mysqldump -u user -p haven_institute > backup-$(date +%Y%m%d).sql

# 2. Test migration on staging environment first

# 3. Apply migration
npx prisma migrate deploy

# 4. If migration fails, rollback
mysql -u user -p haven_institute < backup-20240101.sql
```

### Automated Migration in CI/CD

```yaml
# Example GitHub Actions
- name: Run Migrations
  run: |
    npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# API health
curl https://api.yourdomain.com/health

# Database connection
curl https://api.yourdomain.com/health | jq '.database'
```

### Logging

**PM2 Logs**

```bash
pm2 logs haven-api
pm2 logs haven-api --err
pm2 logs haven-api --lines 100
```

**Docker Logs**

```bash
docker logs haven_api
docker logs -f haven_api --tail 100
```

### Monitoring Tools

- **PM2 Monitoring**: `pm2 monitor`
- **AWS CloudWatch**: For ECS/EC2 deployments
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Application Monitoring**: New Relic, DataDog, Sentry

### Backup Strategy

**Database Backups**

```bash
# Daily backup cron job
0 2 * * * mysqldump -u user -ppassword haven_institute | gzip > /backups/haven-$(date +\%Y\%m\%d).sql.gz

# Automated RDS backups (AWS)
aws rds modify-db-instance \
  --db-instance-identifier haven-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00"
```

### Updates and Scaling

**Zero-Downtime Deployment**

```bash
# Using PM2
pm2 reload haven-api

# Using Docker
docker-compose pull
docker-compose up -d --no-deps --build api
```

**Horizontal Scaling**

- Add load balancer (AWS ALB, Hetzner Load Balancer)
- Deploy multiple instances
- Use Redis for session storage

---

## Troubleshooting

### Common Issues

**1. Database Connection Errors**

```bash
# Check database is running
docker ps | grep mariadb

# Test connection
mysql -h host -u user -p

# Verify DATABASE_URL format
echo $DATABASE_URL
```

**2. Migration Failures**

```bash
# Check migration status
npx prisma migrate status

# Reset Prisma client
rm -rf node_modules/.prisma
npx prisma generate
```

**3. Port Already in Use**

```bash
# Find process using port 3001
lsof -i :3001
sudo kill -9 <PID>
```

---

## Security Checklist

- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Enable HTTPS/SSL for all endpoints
- [ ] Restrict CORS_ORIGIN to your domain only
- [ ] Use environment variables for all secrets
- [ ] Enable firewall (UFW, AWS Security Groups)
- [ ] Regular security updates (`apt upgrade`)
- [ ] Database backups configured
- [ ] Stripe webhook signature verification enabled
- [ ] Rate limiting configured (optional, use express-rate-limit)
- [ ] Helmet.js security headers enabled (already in server.ts)

---

## Support

For issues or questions:
1. Check application logs
2. Verify environment configuration
3. Review database migrations
4. Contact development team

---

Last Updated: 2024
