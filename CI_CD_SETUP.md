# Haven Institute CI/CD Setup Guide

## Overview

This guide covers setting up automated CI/CD for Haven Institute using GitHub Actions and Docker containers.

## 🚀 Features

### Automated Pipeline
- **Frontend & Backend Testing**: Lint, build, and test on every push
- **Security Scanning**: Trivy vulnerability scanner and CodeQL analysis
- **Docker Builds**: Automated container image building and pushing
- **Zero-Downtime Deployment**: Rolling updates with health checks
- **Environment Promotion**: Separate staging and production environments
- **Automated Rollbacks**: Failed deployments trigger automatic rollback

### Deployment Targets
- **Production**: Hetzner server (main branch)
- **Staging**: Development server (develop branch)
- **Security**: GitHub Container Registry for image storage

## 📋 Prerequisites

### GitHub Repository Setup
1. Enable GitHub Actions in your repository
2. Configure repository secrets (see below)
3. Ensure Docker Hub or GitHub Container Registry access

### Server Requirements
- Ubuntu 20.04+ or CentOS 8+
- Docker and Docker Compose installed
- SSH key access for GitHub Actions
- SSL certificates (handled by Caddy)

## 🔧 Configuration

### 1. GitHub Secrets

Add these secrets to your GitHub repository (`Settings` > `Secrets and variables` > `Actions`):

#### Production Secrets
```bash
HETZNER_HOST=your-server-ip
HETZNER_USER=root
HETZNER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
... your private key content ...
-----END OPENSSH PRIVATE KEY-----

DB_ROOT_PASSWORD=your_database_root_password
DB_PASSWORD=your_database_password
REDIS_PASSWORD=your_redis_password

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

DEEPSEEK_API_KEY=sk-...
OPENAI_API_KEY=sk-...
GROK_API_KEY=xai-...
```

#### Staging Secrets (if applicable)
```bash
STAGING_HOST=staging-server-ip
STAGING_USER=root
STAGING_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
... staging private key ...
-----END OPENSSH PRIVATE KEY-----
```

#### Notification Secrets (optional)
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 2. Server Setup

#### Install Docker and Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Setup Project Directory
```bash
# Create project directory
sudo mkdir -p /opt/haveninstitute
sudo chown $USER:$USER /opt/haveninstitute

# Clone repository
cd /opt/haveninstitute
git clone https://github.com/Haven-Technologies-Inc/Haveninstitute.git .

# Setup environment
cp .env.ci.template .env.ci
# Edit .env.ci with your production values
```

#### Configure SSH for GitHub Actions
```bash
# Generate SSH key for GitHub Actions
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions

# Add public key to authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Copy private key content for GitHub Secrets
cat ~/.ssh/github_actions
```

#### Setup CI/CD Script
```bash
# Make deployment script executable
chmod +x scripts/deploy-ci.sh

# Create necessary directories
mkdir -p logs backups

# Test deployment script
./scripts/deploy-ci.sh
```

### 3. Environment Configuration

#### Production Environment (.env.ci)
```bash
# Copy template and configure
cp .env.ci.template .env.ci

# Edit with your values
nano .env.ci
```

#### Key Configuration Items
```bash
# Domain
DOMAIN=havenstudy.com

# Container Images (will be updated by CI/CD)
FRONTEND_IMAGE=ghcr.io/haven-technologies-inc/haveninstitute-frontend:main-latest
BACKEND_IMAGE=ghcr.io/haven-technologies-inc/haveninstitute-backend:main-latest

# Database
DB_PASSWORD=your_secure_password
DB_ROOT_PASSWORD=your_root_password

# Rate Limiting (Production Optimized)
AUTH_RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_MAX_REQUESTS=200

# API Keys
DEEPSEEK_API_KEY=sk-your-key
OPENAI_API_KEY=sk-your-key
STRIPE_SECRET_KEY=sk-your-key
```

## 🔄 Workflow Triggers

### Automatic Triggers
- **Push to main**: Triggers full production deployment
- **Push to develop**: Triggers staging deployment
- **Pull requests**: Triggers build and test only

### Manual Triggers
You can manually trigger workflows from GitHub Actions tab.

## 📊 Monitoring & Logging

### Deployment Logs
```bash
# View deployment logs
tail -f /opt/haveninstitute/logs/deploy.log

# View service logs
docker compose logs -f
```

### Health Checks
```bash
# Backend health
curl https://api.havenstudy.com/api/v1/health

# Frontend health
curl -I https://havenstudy.com

# Container status
docker compose ps
```

### Monitoring Dashboards
- GitHub Actions provides build/deployment status
- Server logs provide runtime monitoring
- Health checks provide service availability

## 🚨 Troubleshooting

### Common Issues

#### 1. SSH Authentication Failed
```bash
# Check SSH key permissions
chmod 600 ~/.ssh/github_actions

# Test SSH connection
ssh -i ~/.ssh/github_actions root@your-server-ip
```

#### 2. Docker Pull Failed
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Check image availability
docker pull ghcr.io/haven-technologies-inc/haveninstitute-backend:main-latest
```

#### 3. Health Check Failed
```bash
# Check service logs
docker compose logs backend
docker compose logs frontend

# Manual health check
curl -I http://localhost:3001/api/v1/health
```

#### 4. Database Migration Failed
```bash
# Check database connection
docker compose exec backend npm run migrate

# Manual database check
docker compose exec mariadb mysql -u root -p -e "SHOW DATABASES;"
```

### Rollback Procedures

#### Automatic Rollback
The CI/CD pipeline automatically rolls back if health checks fail.

#### Manual Rollback
```bash
# Rollback to previous version
git checkout previous-commit-hash
docker compose up -d --build

# Or use previous images
docker compose pull
docker compose up -d
```

## 🔒 Security Considerations

### GitHub Secrets
- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly

### Container Security
- Images are scanned for vulnerabilities
- Non-root user in containers
- Security headers enabled

### Network Security
- HTTPS enforced with Let's Encrypt
- Firewall configured properly
- Rate limiting enabled

## 📈 Performance Optimizations

### Build Optimizations
- Docker layer caching
- Parallel builds
- Artifact caching

### Deployment Optimizations
- Zero-downtime deployment
- Health checks
- Gradual rollout

### Runtime Optimizations
- Redis caching
- Database connection pooling
- CDN for static assets

## 🧪 Testing

### Local Testing
```bash
# Test CI/CD script locally
./scripts/deploy-ci.sh

# Test Docker Compose
docker compose -f docker-compose.ci.yml up -d
```

### Staging Testing
- Use develop branch for staging
- Test deployments before production
- Validate configurations

## 📞 Support

### Getting Help
1. Check GitHub Actions logs
2. Review server logs
3. Check health endpoints
4. Review this documentation

### Emergency Contacts
- DevOps team for server issues
- Development team for application issues
- Infrastructure team for network issues

---

## 🎉 Deployment Success!

Once set up, your CI/CD pipeline will:
- ✅ Automatically test every push
- ✅ Build and push Docker images
- ✅ Deploy with zero downtime
- ✅ Monitor health and rollback on failure
- ✅ Send notifications on completion

Your Haven Institute platform will be automatically deployed and monitored! 🚀
