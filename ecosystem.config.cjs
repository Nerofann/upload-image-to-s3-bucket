module.exports = {
  apps: [{
    name: 'upload-image-backend',
    script: './backend/server.js',
    instances: 1,
    autorestart: true,
    restart_delay: 3000,
    max_restart: 10,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './backend/logs/err.log',
    out_file: './backend/logs/out.log',
    log_file: './backend/logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
