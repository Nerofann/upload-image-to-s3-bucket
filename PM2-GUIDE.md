# PM2 Configuration Guide

## 📦 Installation

Install PM2 globally:
```bash
npm install -g pm2
```

## 🚀 Usage

### Start Application
```bash
# From backend directory
cd backend
npm run pm2:start

# Or from root directory
pm2 start ecosystem.config.js
```

### Manage Application
```bash
# Stop
npm run pm2:stop

# Restart
npm run pm2:restart

# Delete
npm run pm2:delete

# View logs
npm run pm2:logs

# Monitor
npm run pm2:monit
```

### PM2 Commands
```bash
# List all processes
pm2 list

# Show detailed info
pm2 show upload-image-backend

# View logs (real-time)
pm2 logs upload-image-backend

# View only error logs
pm2 logs upload-image-backend --err

# Clear logs
pm2 flush

# Monitor CPU/Memory
pm2 monit
```

## 🔧 Configuration

### Environment Variables

PM2 will automatically load `.env` file from backend directory.

Required variables in `backend/.env`:
```env
PORT=3001
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_BUCKET_NAME=your-bucket-name
```

### Production Mode

Start with production environment:
```bash
pm2 start ecosystem.config.js --env production
```

## 📊 Logs

Logs are stored in `backend/logs/`:
- `err.log` - Error logs
- `out.log` - Output logs
- `combined.log` - Combined logs

## 🔄 Auto Restart

PM2 will automatically restart the app if:
- Application crashes
- Memory exceeds 1GB
- File changes (if watch enabled)

## 💾 Startup Script

To auto-start on server reboot:
```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save

# Resurrect saved processes after reboot
pm2 resurrect
```

## 🔒 Security

- Never commit `.env` files
- Use PM2 keymetrics for monitoring (optional)
- Set up proper firewall rules
- Use reverse proxy (nginx) for production

## 📝 Useful Commands

```bash
# Update PM2
npm install -g pm2@latest
pm2 update

# Reset restart count
pm2 reset upload-image-backend

# Reload (0-second downtime)
pm2 reload upload-image-backend

# Scale to multiple instances
pm2 scale upload-image-backend 4
```

## 🐛 Troubleshooting

### Check if PM2 is running
```bash
pm2 status
```

### Check logs for errors
```bash
pm2 logs upload-image-backend --lines 100
```

### Restart if stuck
```bash
pm2 restart upload-image-backend --update-env
```

### Delete and start fresh
```bash
pm2 delete upload-image-backend
pm2 start ecosystem.config.js
```
