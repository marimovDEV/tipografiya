# PrintERP - SQLite Database Setup

## Current Configuration ✅

**Database:** SQLite3  
**Location:** `backend/db.sqlite3`  
**Status:** Already configured and working!

---

## Why SQLite?

✅ **Simple** - No separate database server needed  
✅ **Fast** - Great for development and small-medium businesses  
✅ **Portable** - Single file, easy to backup  
✅ **Zero Setup** - Works out of the box  
✅ **Reliable** - Production-ready for <100K transactions/day

---

## Current Settings

**File:** `backend/core/settings.py`

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**Database File:** `/backend/db.sqlite3`

---

## Backup

### Manual Backup
```bash
# Backup
cp backend/db.sqlite3 backup_$(date +%Y%m%d).sqlite3

# Restore
cp backup_20260104.sqlite3 backend/db.sqlite3
```

### Automated Backup (Cron)
```bash
# Add to crontab
0 2 * * * cp /path/to/backend/db.sqlite3 /backups/db_$(date +\%Y\%m\%d).sqlite3
```

---

## Docker Configuration

Updated `docker-compose.yml` to use SQLite:
- ❌ Removed PostgreSQL service
- ✅ Added SQLite volume mount
- ✅ Shared database between backend and celery

---

## Migration to PostgreSQL (If Needed Later)

If you outgrow SQLite (>100K transactions/day), migration is easy:

### 1. Export Data
```bash
python manage.py dumpdata > data.json
```

### 2. Update settings.py
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'printery',
        'USER': 'printery',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 3. Import Data
```bash
python manage.py migrate
python manage.py loaddata data.json
```

---

## Performance Tips

### Enable WAL Mode (Better concurrency)
```bash
sqlite3 backend/db.sqlite3 "PRAGMA journal_mode=WAL;"
```

### Optimize Database
```bash
sqlite3 backend/db.sqlite3 "VACUUM;"
```

### Check File Size
```bash
ls -lh backend/db.sqlite3
```

---

## Current Status

✅ SQLite already configured  
✅ Database file: `backend/db.sqlite3`  
✅ All migrations applied  
✅ Working perfectly!

**No changes needed - you're already using SQLite!**

---

*Last updated: January 4, 2026*
