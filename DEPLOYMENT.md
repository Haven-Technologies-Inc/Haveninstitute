# Haven Institute - Hetzner Deployment Guide

Complete guide for deploying Haven Institute to Hetzner Cloud VPS.

## Prerequisites

- Hetzner Cloud account
- Domain name (e.g., `havenstudy.com`)
- SSH key pair
- Basic Linux knowledge

---

## 1. Server Setup on Hetzner

### 1.1 Create VPS

1. Log in to [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Create new project: "Haven Institute"
3. Add Server:
   - **Location:** Nuremberg or Falkenstein (EU) or Ashburn (US)
   - **Image:** Ubuntu 22.04
   - **Type:** CX21 (2 vCPU, 4GB RAM) minimum, CX31 recommended
   - **Networking:** Enable IPv4 and IPv6
   - **SSH Keys:** Add your public key
   - **Name:** `haven-production`

4. Note the IP address after creation

### 1.2 Configure DNS

Add these DNS records to your domain:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 300 |
| A | www | YOUR_SERVER_IP | 300 |
| A | api | YOUR_SERVER_IP | 300 |
| A | traefik | YOUR_SERVER_IP | 300 |

### 1.3 Initial Server Setup

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl git ufw fail2ban

# Configure firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Create deploy user
adduser deploy
usermod -aG sudo deploy

# Copy SSH key to deploy user
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Switch to deploy user
su - deploy
```

---

## 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add deploy user to docker group
sudo usermod -aG docker deploy

# Log out and back in for group changes
exit
ssh deploy@YOUR_SERVER_IP

# Verify Docker installation
docker --version
docker compose version
```

---

## 3. Deploy Application

### 3.1 Clone Repository

```bash
# Create app directory
mkdir -p ~/apps
cd ~/apps

# Clone repository
git clone https://github.com/YOUR_USERNAME/Haveninstitute.git
cd Haveninstitute
```

### 3.2 Configure Environment

```bash
# Copy environment template
cp .env.docker .env

# Edit with your values
nano .env
```

**Required `.env` values:**

```env
# Domain
DOMAIN=havenstudy.com
ACME_EMAIL=admin@havenstudy.com

# Frontend
VITE_API_URL=https://api.havenstudy.com/api/v1
VITE_WS_URL=wss://api.havenstudy.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxx

# Database (generate strong passwords!)
DB_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_NAME=haven_institute
DB_USER=haven_user
DB_PASSWORD=$(openssl rand -base64 32)

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# Traefik Auth (generate with htpasswd)
# htpasswd -nb admin YOUR_PASSWORD
TRAEFIK_AUTH=admin:$apr1$...
```

### 3.3 Configure Backend Environment

```bash
# Copy backend environment
cp backend/.env.production.example backend/.env.production

# Edit with production values
nano backend/.env.production
```

### 3.4 Deploy

```bash
# Make deploy script executable
chmod +x scripts/deploy.sh
chmod +x scripts/backup.sh

# Run deployment
./scripts/deploy.sh production
```

---

## 4. Post-Deployment

### 4.1 Verify Deployment

```bash
# Check container status
docker compose ps

# Check logs
docker compose logs -f

# Test endpoints
curl https://havenstudy.com
curl https://api.havenstudy.com/api/v1/health
```

### 4.2 Setup Automatic Backups

```bash
# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/deploy/apps/Haveninstitute/scripts/backup.sh >> /var/log/haven-backup.log 2>&1
```

### 4.3 Setup Monitoring (Optional)

```bash
# Install Netdata for monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access at http://YOUR_SERVER_IP:19999
```

---

## 5. Maintenance Commands

### View Logs
```bash
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only
docker compose logs -f frontend     # Frontend only
```

### Restart Services
```bash
docker compose restart              # All services
docker compose restart backend      # Backend only
```

### Update Application
```bash
cd ~/apps/Haveninstitute
git pull origin main
docker compose build --no-cache
docker compose up -d
```

### Database Access
```bash
docker compose exec mariadb mysql -u haven_user -p haven_institute
```

### Backup Database Manually
```bash
./scripts/backup.sh
```

### View Container Resources
```bash
docker stats
```

---

## 6. Troubleshooting

### Container Won't Start
```bash
# Check logs
docker compose logs backend

# Check container status
docker compose ps

# Restart specific service
docker compose restart backend
```

### Database Connection Issues
```bash
# Verify MariaDB is healthy
docker compose exec mariadb mysql -u root -p -e "SELECT 1"

# Check connection from backend
docker compose exec backend ping mariadb
```

### SSL Certificate Issues
```bash
# Check Traefik logs
docker compose logs traefik

# Verify ACME challenge
curl http://yourdomain.com/.well-known/acme-challenge/test
```

### Out of Disk Space
```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a
```

---

## 7. Security Checklist

- [ ] SSH key authentication only (disable password login)
- [ ] Firewall enabled (UFW)
- [ ] Fail2ban installed
- [ ] Strong database passwords
- [ ] SSL/TLS enabled via Traefik
- [ ] Regular backups configured
- [ ] Log monitoring set up

---

## 8. Recommended Hetzner Specs

| Environment | Server Type | vCPU | RAM | Storage | Monthly Cost |
|-------------|-------------|------|-----|---------|--------------|
| Development | CX11 | 1 | 2GB | 20GB | ~€3.29 |
| Staging | CX21 | 2 | 4GB | 40GB | ~€5.83 |
| Production | CX31 | 2 | 8GB | 80GB | ~€10.59 |
| High Traffic | CX41 | 4 | 16GB | 160GB | ~€18.04 |

---

## Support

For issues with deployment:
1. Check container logs: `docker compose logs`
2. Check this documentation
3. Contact: support@havenstudy.com
