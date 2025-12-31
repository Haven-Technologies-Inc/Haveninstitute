# Hetzner Live Deployment Update

## Quick Update Commands

### 1. SSH into your Hetzner server
```bash
ssh root@your-server-ip
```

### 2. Navigate to project directory
```bash
cd /path/to/Haveninstitute
```

### 3. Pull latest changes
```bash
git pull origin main
```

### 4. Update and restart services
```bash
# Zero downtime update
docker compose up -d --build

# Or use the update script
chmod +x scripts/update-hetzner.sh
./scripts/update-hetzner.sh
```

### 5. Check status
```bash
docker compose ps
docker compose logs -f
```

## What's Being Updated

✅ **New Features Added:**
- Admin settings with AI provider sync (OpenAI, DeepSeek, Grok)
- Database storage for API keys with encryption
- DeepSeek AI integration with advanced NCLEX prompts
- Discussion system (replacing old Forum)
- AI-powered flashcard generator
- Study group functionality
- Global search across content
- Enhanced admin dashboard

✅ **Technical Improvements:**
- Frontend-backend API key synchronization
- Proper error handling and retry logic
- Database migrations for new features
- Updated router and component structure
- Production optimizations

## Verification Steps

After deployment, verify:

1. **Frontend loads**: https://yourdomain.com
2. **Backend API**: https://api.yourdomain.com/api/v1/health
3. **Admin settings work**: Check AI provider configuration
4. **New features accessible**: Discussions, Flashcards, Study Groups
5. **Search functionality**: Global search works

## Troubleshooting

### If something goes wrong:
```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Restart specific service
docker compose restart backend

# Rollback (if needed)
git checkout previous-commit-hash
docker compose up -d --build
```

### Database Issues:
```bash
# Check database connection
docker compose exec backend npm run migrate

# Backup database
docker compose exec mariadb mysqldump -u root -p haven_institute > backup.sql
```

## Environment Variables

Ensure these are set in your `.env` file:
```env
# AI Provider Configuration
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-deepseek-key
OPENAI_API_KEY=your-openai-key
GROK_API_KEY=your-grok-key

# Database (existing)
DB_PASSWORD=your-secure-password
REDIS_PASSWORD=your-redis-password
```

## Support

If issues persist:
1. Check container status: `docker compose ps`
2. Review logs: `docker compose logs -f`
3. Verify environment variables
4. Check resource usage: `docker stats`

The update includes all the latest admin settings improvements and AI provider synchronization!
