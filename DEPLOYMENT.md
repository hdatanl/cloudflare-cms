# Deployment Guide

## Cloudflare Setup

### 1. Create D1 Database

```bash
# Create a new D1 database
wrangler d1 create cms_db

# You'll receive output like:
# ✅ Successfully created DB 'cms_db'
# database_id = xxx-xxx-xxx
```

Zet de `database_id` in je `wrangler.toml`.

### 2. Create R2 Bucket

```bash
# Create a new R2 bucket
wrangler r2 bucket create cms-storage

# For production
wrangler r2 bucket create cms-storage-prod --env production
```

### 3. Initialize Database Schema

```bash
# Apply the schema locally
wrangler d1 execute cms_db --file ./schema.sql --local

# Apply to production
wrangler d1 execute cms_db --file ./schema.sql --env production
```

### 4. Configure Environment Variables

Update je `wrangler.toml`:

```toml
[vars]
JWT_SECRET = "your-super-secret-key-change-this"
JWT_EXPIRY = "24h"
SESSION_TIMEOUT = "3600"
MAX_LOGIN_ATTEMPTS = "5"
LOCKOUT_DURATION = "900"
STORAGE_URL = "https://your-r2-custom-domain.com"
```

### 5. Deploy to Cloudflare Workers

```bash
# Development
wrangler dev

# Production
wrangler deploy --env production
```

## Environment Setup

### Local Development

```bash
# Install dependencies
npm install

# Create local wrangler.toml
cp wrangler.example.toml wrangler.toml

# Setup database locally
npm run db:local

# Start dev server
npm run dev
```

### Production Deployment

1. **Set secrets in Cloudflare Dashboard:**
   - Go to Workers → Your Worker → Settings → Variables
   - Add `JWT_SECRET` as a secret

2. **Configure R2:**
   - Create custom domain for R2 bucket
   - Set `STORAGE_URL` in wrangler.toml

3. **Deploy:**
   ```bash
   npm run build
   wrangler deploy --env production
   ```

## First Admin User

After deployment, create the first admin user:

```bash
# Use the API
curl -X POST https://your-cms.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "password": "SecurePassword123!"
  }'
```

Then manually update the role in D1:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Monitoring

### View Logs

```bash
# Recent logs
wrangler tail

# Filtered logs
wrangler tail --format pretty
```

### Database Queries

```bash
# Execute query on production database
wrangler d1 execute cms_db "SELECT * FROM users LIMIT 10" --env production
```

## Troubleshooting

### Database Connection Issues
- Verify `database_id` in wrangler.toml
- Check D1 binding in environment settings
- Ensure database is in same account

### R2 Upload Fails
- Verify R2 bucket exists
- Check IAM permissions
- Ensure storage URL is correct

### 2FA Not Working
- Verify `speakeasy` dependency is installed
- Check system time is synchronized
- Ensure browser supports TOTP

### CORS Errors
- Check request headers in index.ts
- Verify origin is allowed
- Test with curl first

## Performance Optimization

### Database
- Add indexes for frequently queried fields (done in schema)
- Use pagination for large result sets
- Cache frequently accessed data

### Storage
- Use R2 custom domain for faster delivery
- Compress images before upload
- Set cache headers on R2 objects

### Worker
- Use edge caching for static content
- Minimize bundle size
- Use async/await efficiently

## Security Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Enable 2FA for all admin accounts
- [ ] Set up CORS properly for your domain
- [ ] Use HTTPS for all connections
- [ ] Regularly update dependencies
- [ ] Enable logging for audit trail
- [ ] Set up rate limiting
- [ ] Use strong passwords (8+ characters, mixed case)

## Scaling

Cloudflare Workers automatically scales based on traffic:
- No need to manage servers
- Pay only for requests
- Unlimited edge locations
- Zero cold starts

D1 and R2 also auto-scale within your plan limits.
