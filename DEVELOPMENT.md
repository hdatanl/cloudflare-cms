# Development Guide

## Project Structure

```
cloudflare-cms/
├── src/
│   ├── index.ts              # Main Worker entry point
│   ├── types/
│   │   └── index.ts          # TypeScript definitions
│   ├── utils/
│   │   ├── crypto.ts         # Cryptography utilities
│   │   └── jwt.ts            # JWT handling
│   ├── services/
│   │   ├── auth.ts           # Authentication service
│   │   ├── content.ts        # Content management
│   │   └── media.ts          # Media handling
│   └── routes/
│       ├── auth.ts           # Auth endpoints
│       ├── pages.ts          # Pages endpoints
│       ├── posts.ts          # Posts endpoints
│       └── media.ts          # Media endpoints
├── schema.sql                 # Database schema
├── wrangler.toml             # Wrangler config
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└─��� README.md                 # Project documentation
```

## Development Workflow

### 1. Setup

```bash
npm install
cp wrangler.example.toml wrangler.toml
npm run db:local
```

### 2. Start Development

```bash
npm run dev
```

This starts the local Wrangler dev server at `http://localhost:8787`

### 3. Testing

```bash
# Test API endpoints
curl http://localhost:8787/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123!"
  }'
```

## Adding New Features

### Adding a New API Endpoint

1. **Create service method** (e.g., `src/services/content.ts`)
2. **Create route handler** (e.g., `src/routes/pages.ts`)
3. **Register route** in `src/index.ts`

Example:

```typescript
// 1. Service (src/services/content.ts)
async getPageById(id: string): Promise<Page | null> {
  return await this.db.prepare('SELECT * FROM pages WHERE id = ?')
    .bind(id).first() as Page;
}

// 2. Route (src/routes/pages.ts)
router.get('/api/pages/:id', async (request, env) => {
  const { id } = request.params;
  const service = new ContentService(env.DB, env);
  const page = await service.getPageById(id);
  return new Response(JSON.stringify(page), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// 3. Register in index.ts
if (url.pathname.startsWith('/api/pages')) {
  return pagesRouter.handle(request, env);
}
```

### Adding Database Tables

1. Edit `schema.sql`
2. Run migration:
   ```bash
   npm run db:local
   ```

### Adding New Types

Update `src/types/index.ts`:

```typescript
export interface MyEntity {
  id: string;
  name: string;
  created_at: string;
}
```

## Authentication Flow

### Login with 2FA

```
1. User enters email/password
   ↓
2. Server validates credentials
   ↓
3. If 2FA enabled → return 202 with userId
   ↓
4. User enters 2FA code
   ↓
5. Server validates TOTP token
   ↓
6. Return JWT token and session
```

### Token Validation

Every protected endpoint:
1. Extracts Authorization header
2. Verifies JWT signature
3. Checks expiration
4. Returns user data or 401

## Database Operations

### Common Queries

```typescript
// Select
const user = await db.prepare('SELECT * FROM users WHERE id = ?')
  .bind(userId).first();

// Insert
await db.prepare('INSERT INTO users (id, email) VALUES (?, ?)')
  .bind(id, email).run();

// Update
await db.prepare('UPDATE users SET role = ? WHERE id = ?')
  .bind('admin', userId).run();

// Delete
await db.prepare('DELETE FROM users WHERE id = ?')
  .bind(userId).run();
```

## Frontend Development

The frontend is built-in to the Worker. Key areas:

- **Login Modal** - Appears on `/dashboard`
- **Dashboard** - Sidebar navigation
- **Sections** - Pages, Posts, Media, Settings
- **Styling** - Tailwind-like utility classes

### Modifying Frontend

Edit the HTML in `src/index.ts`:
- `getFrontendHTML()` - Public pages
- `getDashboardHTML()` - Admin dashboard

### Adding New Pages

Add new routes in `src/index.ts`:

```typescript
if (url.pathname === '/new-page') {
  const html = await getNewPageHTML(env);
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
```

## Best Practices

### Security
- Always validate input
- Use parameterized queries
- Hash passwords with bcrypt
- Verify JWT tokens
- Check user roles

### Performance
- Use pagination for lists
- Add database indexes
- Cache static content
- Minimize JSON responses
- Use async/await properly

### Code Quality
- Use TypeScript strictly
- Add error handling
- Log important events
- Write self-documenting code
- Use meaningful variable names

## Debugging

### Enable Debug Logging

```typescript
console.log('Debug:', { message, data });

// View in logs
wrangler tail
```

### Test with curl

```bash
# Login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Get pages with token
curl http://localhost:8787/api/pages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Debugging

```bash
# Query database
wrangler d1 execute cms_db "SELECT * FROM users" --local

# View schema
wrangler d1 execute cms_db ".schema" --local
```

## Testing Checklist

- [ ] User registration works
- [ ] Login with correct credentials works
- [ ] Login fails with wrong password
- [ ] 2FA setup generates valid QR code
- [ ] 2FA verification works
- [ ] Create page/post
- [ ] Edit page/post
- [ ] Publish content
- [ ] Upload media
- [ ] Delete content
- [ ] Logout works
- [ ] Responsive on mobile
