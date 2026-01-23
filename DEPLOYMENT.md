# PrintERP - Production Deployment Guide

## 🎯 Pre-Deployment Checklist

### Backend
- [ ] All migrations applied
- [ ] Superuser created
- [ ] Static files collected
- [ ] Database backup configured
- [ ] CORS configured for production domain
- [ ] DEBUG=False set
- [ ] SECRET_KEY changed
- [ ] Environment variables configured

### Frontend
- [ ] Production build tested
- [ ] API URL updated
- [ ] Environment variables set
- [ ] Build optimized

---

## 🚀 Production Setup

### Option 1: Simple VPS Deployment

#### 1. Server Requirements
```
- Ubuntu 20.04+ / CentOS 8+
- Python 3.10+
- Node.js 18+
- 2GB RAM minimum
- 20GB disk space
```

#### 2. Backend Setup

```bash
# Install system dependencies
sudo apt update
sudo apt install python3-pip python3-venv nginx postgresql

# Clone project
cd /var/www
git clone <your-repo> erp

# Setup Python environment
cd /var/www/erp/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Configure environment
cp .env.example .env
nano .env
```

**.env (Production):**
```env
DEBUG=False
SECRET_KEY=<generate-secure-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost/erp_db
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

```bash
# Setup database
sudo -u postgres createdb erp_db
sudo -u postgres createuser erp_user
sudo -u postgres psql -c "ALTER USER erp_user PASSWORD 'strong_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE erp_db TO erp_user;"

# Run migrations
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput

# Test
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

#### 3. Frontend Setup

```bash
cd /var/www/erp/frontend

# Install dependencies
npm install

# Create production env
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > .env.production

# Build
npm run build

# Test
npm start
```

#### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/erp

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/erp/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/erp/backend/media/;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Systemd Services

**Backend Service:**
```ini
# /etc/systemd/system/erp-backend.service
[Unit]
Description=PrintERP Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/erp/backend
Environment="PATH=/var/www/erp/backend/venv/bin"
ExecStart=/var/www/erp/backend/venv/bin/gunicorn core.wsgi:application \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --log-file /var/log/erp/backend.log

[Install]
WantedBy=multi-user.target
```

**Frontend Service:**
```ini
# /etc/systemd/system/erp-frontend.service
[Unit]
Description=PrintERP Frontend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/erp/frontend
ExecStart=/usr/bin/npm start
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start services
sudo systemctl enable erp-backend erp-frontend
sudo systemctl start erp-backend erp-frontend

# Check status
sudo systemctl status erp-backend
sudo systemctl status erp-frontend
```

#### 6. SSL Setup (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
sudo systemctl reload nginx
```

---

## 📊 Monitoring & Maintenance

### Database Backup Script

```bash
#!/bin/bash
# /usr/local/bin/erp-backup.sh

BACKUP_DIR="/var/backups/erp"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
pg_dump erp_db > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql

# Media backup
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/erp/backend/media/

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

**Cron:**
```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/erp-backup.sh >> /var/log/erp/backup.log 2>&1
```

### Health Check Endpoint

Add to `backend/api/views.py`:
```python
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'database': 'ok',
        'version': '1.0'
    })
```

**Monitor:** `curl https://api.yourdomain.com/api/health/`

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Set strong SECRET_KEY
- [ ] Enable HTTPS only
- [ ] Configure firewall (ufw)
- [ ] Disable root SSH login
- [ ] Setup fail2ban
- [ ] Regular security updates
- [ ] Database regular backups
- [ ] Monitor error logs

---

## 📈 Performance Tips

### Backend
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 600,  # Connection pooling
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

### Frontend
- Use CDN for static assets
- Enable Next.js image optimization
- Use production build only

---

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check logs
sudo journalctl -u erp-backend -f

# Test manually
cd /var/www/erp/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### Database connection issues
```bash
# Test connection
sudo -u postgres psql erp_db
\dt  # List tables

# Check credentials
cat /var/www/erp/backend/.env
```

### Static files not loading
```bash
# Recollect static files
cd /var/www/erp/backend
source venv/bin/activate
python manage.py collectstatic --clear --noinput

# Check Nginx config
sudo nginx -t
```

---

## 📞 Support

**Production Issues:**
1. Check logs: `/var/log/erp/`
2. Monitor health: `/api/health/`
3. Database backup: `/var/backups/erp/`

**Emergency Rollback:**
```bash
# Restore database
gunzip < /var/backups/erp/db_YYYYMMDD_HHMMSS.sql.gz | psql erp_db

# Restart services
sudo systemctl restart erp-backend erp-frontend
```

---

## ✅ Post-Deployment

- [ ] Test all user flows
- [ ] Verify backups working
- [ ] Monitor first 24h
- [ ] Setup error alerts
- [ ] Train users
- [ ] Document custom changes

**Deployed! 🎉**
