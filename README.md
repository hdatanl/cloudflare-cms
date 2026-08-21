# Cloudflare CMS

Een volwaardig CMS systeem dat draait volledig op Cloudflare Workers, D1 (database) en R2 (opslag).

## Features

✅ **Authentificatie met 2FA**
- Email/wachtwoord login
- Two-Factor Authentication (TOTP)
- Backup codes
- Rolgebaseerde toegangscontrole

✅ **Content Management**
- Pagina's beheren (CRUD)
- Blog artikelen met categorieën
- Versiebeheer
- Draft/Publish workflow

✅ **Media Management**
- Bestanden uploaden naar R2
- Afbeeldingen en media beheren
- Alt-text ondersteuning
- Zoeken in media

✅ **Responsive Design**
- Volledig responsive UI
- Werkt op desktop en mobiel
- Tailwind-achtige CSS

✅ **Cloudflare Stack**
- Draait op Workers (serverless)
- D1 database
- R2 object storage
- Zero cold starts

## Setup

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI

### Installatie

\`\`\`bash
# Clone the repository
git clone https://github.com/hdatanl/cloudflare-cms.git
cd cloudflare-cms

# Install dependencies
npm install

# Configure wrangler
cp wrangler.example.toml wrangler.toml
# Edit wrangler.toml met je Cloudflare credentials

# Initialize database
npm run db:local

# Start development server
npm run dev

# Deploy to production
npm run deploy
\`\`\`

## API Endpoints

### Authentication
- \`POST /api/auth/register\` - Registratie
- \`POST /api/auth/login\` - Login
- \`GET /api/auth/me\` - Huidige gebruiker
- \`POST /api/auth/logout\` - Uitloggen
- \`POST /api/auth/2fa/setup\` - 2FA inschakelen
- \`POST /api/auth/2fa/confirm\` - 2FA confirmatie

### Pages
- \`GET /api/pages\` - Alle pagina's
- \`GET /api/pages/:slug\` - Specifieke pagina
- \`POST /api/pages\` - Pagina maken
- \`PUT /api/pages/:id\` - Pagina updaten
- \`DELETE /api/pages/:id\` - Pagina verwijderen
- \`POST /api/pages/:id/publish\` - Pagina publiceren

### Posts
- \`GET /api/posts\` - Alle artikelen
- \`GET /api/posts/:slug\` - Specifiek artikel
- \`GET /api/posts/category/:category\` - Artikelen per categorie
- \`POST /api/posts\` - Artikel maken
- \`PUT /api/posts/:id\` - Artikel updaten
- \`DELETE /api/posts/:id\` - Artikel verwijderen
- \`POST /api/posts/:id/publish\` - Artikel publiceren

### Media
- \`GET /api/media\` - Alle media
- \`GET /api/media/search?q=query\` - Media zoeken
- \`POST /api/media/upload\` - Media uploaden
- \`PUT /api/media/:id\` - Media bijwerken
- \`DELETE /api/media/:id\` - Media verwijderen

## Database Schema

Het CMS gebruikt D1 (SQLite) met de volgende tabellen:
- \`users\` - Gebruikers met 2FA ondersteuning
- \`sessions\` - Sessiemanagement
- \`pages\` - Pagina's
- \`posts\` - Blog artikelen
- \`media\` - Geüploade bestanden
- \`audit_logs\` - Activiteitenlogboek

## Beveiliging

- JWT tokens voor authentificatie
- bcrypt voor wachtwoordhashing
- 2FA met TOTP (Time-based One-Time Password)
- CORS bescherming
- Rate limiting mogelijkheden
- Rolgebaseerde toegangscontrole (RBAC)

## Performance

- Cloudflare edge network
- Cached responses
- Optimized D1 queries
- R2 direct file serving

## Mobiel Responsive

Het CMS is volledig responsive:
- Desktop: 1200px+ (3-column layouts)
- Tablet: 768px-1199px (2-column layouts)
- Mobiel: <768px (1-column layouts)

## Toekomstige Features

- [ ] WYSIWYG editor
- [ ] Uitgebreide SEO tools
- [ ] Webhooks
- [ ] Themes
- [ ] Plugins systeem
- [ ] Analytics

## Licentie

MIT

## Support

Voor vragen of bugs, open een issue op GitHub.
