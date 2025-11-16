# Deployment Guide

## 🚀 Quick Deploy with Docker

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Steps

1. **Clone and Configure**
```bash
git clone <repository>
cd backend
cp .env.example .env
# Edit .env with production values
```

2. **Start Services**
```bash
docker-compose up -d
```

3. **Verify**
```bash
curl http://localhost:3001/api/v1/health
```

## 🌐 Production Deployment

### Option 1: AWS EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium (minimum)
   - Security Group: Allow ports 22, 80, 443, 3001

2. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MariaDB
sudo apt install -y mariadb-server

# Install Redis (optional)
sudo apt install -y redis-server

# Install Docker (for containerized deployment)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

3. **Setup Application**
```bash
git clone <repository>
cd backend
npm install
npm run build
```

4. **Setup Database**
```bash
sudo mysql -u root
CREATE DATABASE haven_institute;
CREATE USER 'haven_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL ON haven_institute.* TO 'haven_user'@'localhost';
exit;

# Run migrations
npm run migrate
npm run seed
```

5. **Setup PM2 (Process Manager)**
```bash
npm install -g pm2
pm2 start dist/server.js --name haven-api
pm2 startup
pm2 save
```

6. **Setup Nginx**
```bash
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/haven-api

# Add configuration:
server {
    listen 80;
    server_name api.haveninstitute.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/haven-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Setup SSL with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.haveninstitute.com
```

### Option 2: DigitalOcean App Platform

1. **Connect Repository**
   - Link GitHub/GitLab repository
   - Select backend directory

2. **Configure Build**
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`

3. **Add Database**
   - Create Managed MariaDB database
   - Add connection string to environment variables

4. **Environment Variables**
   - Set all required env vars in App Platform dashboard

5. **Deploy**
   - Click "Deploy"
   - Monitor logs

### Option 3: Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Create App**
```bash
heroku create haven-api
```

3. **Add Database**
```bash
heroku addons:create jawsdb:kitefin
```

4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set STRIPE_SECRET_KEY=sk_live_xxx
# ... etc
```

5. **Deploy**
```bash
git push heroku main
heroku logs --tail
```

## 🔒 Security Checklist

Before going live:

- [ ] Strong JWT secrets (min 32 characters)
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Database passwords changed from defaults
- [ ] Firewall configured (UFW/Security Groups)
- [ ] Environment variables secured
- [ ] API keys for Stripe/OpenAI are production keys
- [ ] Logging configured
- [ ] Monitoring setup (Sentry, New Relic, etc.)
- [ ] Database backups automated
- [ ] Health checks configured
- [ ] Error tracking enabled

## 📊 Monitoring

### Health Check
```bash
curl https://api.haveninstitute.com/api/v1/health
```

### PM2 Monitoring
```bash
pm2 monit
pm2 logs haven-api
```

### Database
```bash
# Check connections
mysql -u root -p -e "SHOW PROCESSLIST;"

# Check table sizes
mysql -u root -p haven_institute -e "
SELECT table_name,
  ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'haven_institute';"
```

## 🔄 CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run tests
        working-directory: ./backend
        run: npm test

      - name: Build
        working-directory: ./backend
        run: npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/haven-api
            git pull
            npm install
            npm run build
            pm2 restart haven-api
```

## 📈 Scaling

### When to Scale

Monitor these metrics:
- CPU usage > 70% consistently
- Memory usage > 80%
- Response time > 500ms average
- Database connections maxed out

### Horizontal Scaling

1. **Load Balancer** (AWS ALB, Nginx)
2. **Multiple API Instances**
3. **Database Read Replicas**
4. **Redis Cluster** for sessions

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Add indexes
4. Implement caching

## 🗄️ Database Backups

### Automated Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-haven-db.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/haven"
mkdir -p $BACKUP_DIR
mysqldump -u haven_user -p[password] haven_institute | gzip > $BACKUP_DIR/haven_$DATE.sql.gz
find $BACKUP_DIR -type f -mtime +7 -delete

# Make executable
sudo chmod +x /usr/local/bin/backup-haven-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-haven-db.sh
```

### Restore from Backup

```bash
gunzip < backup.sql.gz | mysql -u haven_user -p haven_institute
```

## 🆘 Troubleshooting

### API Not Responding

```bash
# Check if running
pm2 list

# Check logs
pm2 logs haven-api --lines 100

# Restart
pm2 restart haven-api
```

### Database Connection Issues

```bash
# Test connection
mysql -u haven_user -p haven_institute

# Check if MariaDB is running
sudo systemctl status mariadb

# Restart MariaDB
sudo systemctl restart mariadb
```

### High Memory Usage

```bash
# Check memory
free -h

# Check process memory
pm2 monit

# Restart app
pm2 restart haven-api
```

---

**For support, contact: devops@haveninstitute.com**
