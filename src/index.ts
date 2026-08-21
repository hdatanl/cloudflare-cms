import authRouter from './routes/auth';
import pagesRouter from './routes/pages';
import postsRouter from './routes/posts';
import mediaRouter from './routes/media';
import { Env } from './types/index';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Serve static frontend files
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = await getFrontendHTML(env);
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    if (url.pathname === '/dashboard' || url.pathname === '/dashboard/') {
      const html = await getDashboardHTML(env);
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    if (url.pathname.startsWith('/api/auth')) {
      const response = await authRouter.handle(request, env);
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    if (url.pathname.startsWith('/api/pages')) {
      const response = await pagesRouter.handle(request, env);
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    if (url.pathname.startsWith('/api/posts')) {
      const response = await postsRouter.handle(request, env);
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    if (url.pathname.startsWith('/api/media')) {
      const response = await mediaRouter.handle(request, env);
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};

async function getFrontendHTML(env: Env): Promise<string> {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare CMS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    
    /* Utility classes */
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-4 { gap: 1rem; }
    .gap-8 { gap: 2rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .m-4 { margin: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .mb-4 { margin-bottom: 1rem; }
    .text-center { text-align: center; }
    .text-lg { font-size: 1.125rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-3xl { font-size: 1.875rem; }
    .font-bold { font-weight: bold; }
    .bg-white { background-color: white; }
    .bg-gray-50 { background-color: #f9fafb; }
    .bg-blue-600 { background-color: #2563eb; }
    .text-white { color: white; }
    .rounded { border-radius: 0.375rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .border { border: 1px solid #e5e7eb; }
    .w-full { width: 100%; }
    .max-w-md { max-width: 28rem; }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    
    @media (min-width: 768px) {
      .md-grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md-grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    
    /* Header */
    header { background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
    nav { display: flex; justify-content: space-between; align-items: center; }
    nav a { text-decoration: none; color: #333; margin: 0 1rem; }
    nav a:hover { color: #2563eb; }
    
    /* Main */
    main { padding: 4rem 0; }
    
    /* Hero */
    .hero { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 6rem 2rem; text-align: center; }
    .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
    .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
    
    /* Button */
    button, .btn { 
      padding: 0.75rem 1.5rem; 
      border: none; 
      border-radius: 0.375rem; 
      cursor: pointer; 
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    .btn-primary { background-color: #2563eb; color: white; }
    .btn-primary:hover { background-color: #1e40af; }
    .btn-secondary { background-color: #e5e7eb; color: #333; }
    .btn-secondary:hover { background-color: #d1d5db; }
    
    /* Form */
    form { max-width: 28rem; }
    input, textarea { 
      width: 100%; 
      padding: 0.75rem; 
      margin: 0.5rem 0; 
      border: 1px solid #e5e7eb; 
      border-radius: 0.375rem; 
      font-family: inherit;
    }
    input:focus, textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
    
    /* Grid */
    .posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
    .post-card { background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; }
    .post-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .post-card img { width: 100%; height: 200px; object-fit: cover; }
    .post-card-content { padding: 1.5rem; }
    .post-card h3 { margin-bottom: 0.5rem; }
    .post-card p { color: #666; font-size: 0.875rem; }
    
    /* Footer */
    footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 3rem 0; margin-top: 4rem; }
    footer p { text-align: center; color: #666; }
  </style>
</head>
<body>
  <header>
    <nav class="container flex justify-between items-center">
      <h2 class="text-2xl font-bold">CMS</h2>
      <div>
        <a href="/">Home</a>
        <a href="/dashboard">Dashboard</a>
      </div>
    </nav>
  </header>

  <main>
    <section class="hero">
      <h1>Welkom bij Cloudflare CMS</h1>
      <p>Beheer jouw website volledig in de cloud</p>
      <a href="/dashboard" class="btn btn-primary">Naar Dashboard</a>
    </section>

    <section class="container p-8">
      <h2 class="text-3xl font-bold mb-4 text-center">Recente Artikelen</h2>
      <div id="posts" class="posts-grid"></div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2024 Cloudflare CMS. Alle rechten voorbehouden.</p>
    </div>
  </footer>

  <script>
    async function loadPosts() {
      try {
        const response = await fetch('/api/posts?status=published&limit=6');
        const posts = await response.json();
        const postsContainer = document.getElementById('posts');
        
        postsContainer.innerHTML = posts.map(post => \`
          <div class="post-card">
            \${post.featured_image ? \`<img src="\${post.featured_image}" alt="\${post.title}">\` : ''}
            <div class="post-card-content">
              <h3 class="text-lg font-bold">\${post.title}</h3>
              <p>\${post.excerpt || post.content.substring(0, 150)}...</p>
              <a href="/post/\${post.slug}" class="text-blue-600">Lees meer →</a>
            </div>
          </div>
        \`).join('');
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    }
    
    loadPosts();
  </script>
</body>
</html>`;
}

async function getDashboardHTML(env: Env): Promise<string> {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CMS Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; }
    
    /* Utility classes */
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-4 { gap: 1rem; }
    .gap-8 { gap: 2rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .m-4 { margin: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .mb-4 { margin-bottom: 1rem; }
    .text-center { text-align: center; }
    .text-lg { font-size: 1.125rem; }
    .text-2xl { font-size: 1.5rem; }
    .font-bold { font-weight: bold; }
    .bg-white { background-color: white; }
    .rounded { border-radius: 0.375rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .border { border: 1px solid #e5e7eb; }
    .w-full { width: 100%; }
    
    /* Layout */
    .dashboard { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; }
    
    /* Sidebar */
    .sidebar { background: #1f2937; color: white; padding: 2rem 0; }
    .sidebar-menu { list-style: none; }
    .sidebar-menu li { padding: 1rem 1.5rem; border-bottom: 1px solid #374151; cursor: pointer; transition: background 0.3s; }
    .sidebar-menu li:hover { background: #374151; }
    .sidebar-menu li.active { background: #2563eb; }
    
    /* Main content */
    .main-content { padding: 2rem; }
    
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    
    /* Cards */
    .card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    
    /* Form */
    input, textarea, select { 
      width: 100%; 
      padding: 0.75rem; 
      margin: 0.5rem 0; 
      border: 1px solid #e5e7eb; 
      border-radius: 0.375rem; 
      font-family: inherit;
      font-size: 1rem;
    }
    input:focus, textarea:focus, select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
    label { display: block; margin: 1rem 0 0.5rem 0; font-weight: 500; }
    
    /* Buttons */
    button, .btn { 
      padding: 0.75rem 1.5rem; 
      border: none; 
      border-radius: 0.375rem; 
      cursor: pointer; 
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    .btn-primary { background-color: #2563eb; color: white; }
    .btn-primary:hover { background-color: #1e40af; }
    .btn-secondary { background-color: #e5e7eb; color: #333; }
    .btn-secondary:hover { background-color: #d1d5db; }
    .btn-danger { background-color: #ef4444; color: white; }
    .btn-danger:hover { background-color: #dc2626; }
    
    /* Table */
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
    tr:hover { background: #f9fafb; }
    
    /* Alert */
    .alert { padding: 1rem; border-radius: 0.375rem; margin-bottom: 1rem; }
    .alert-error { background: #fee2e2; border-left: 4px solid #ef4444; color: #991b1b; }
    .alert-success { background: #dcfce7; border-left: 4px solid #22c55e; color: #166534; }
    
    /* Modal */
    .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }
    .modal.active { display: flex; }
    .modal-content { background: white; padding: 2rem; border-radius: 0.5rem; max-width: 500px; width: 90%; }
    
    /* Responsive */
    @media (max-width: 768px) {
      .dashboard { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .header { flex-direction: column; gap: 1rem; }
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <aside class="sidebar">
      <h2 style="padding: 0 1.5rem; margin-bottom: 2rem; color: #2563eb;">CMS</h2>
      <ul class="sidebar-menu">
        <li onclick="showSection('dashboard')" class="active">Dashboard</li>
        <li onclick="showSection('pages')">Pagina's</li>
        <li onclick="showSection('posts')">Artikelen</li>
        <li onclick="showSection('media')">Media</li>
        <li onclick="showSection('settings')">Instellingen</li>
        <li onclick="logout()">Uitloggen</li>
      </ul>
    </aside>

    <main class="main-content">
      <div class="header">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <div id="user-info">Laden...</div>
      </div>

      <!-- Dashboard Section -->
      <div id="dashboard" class="section">
        <div class="card">
          <h2 class="text-2xl font-bold mb-4">Welkom!</h2>
          <p>Selecteer een optie in het menu links om aan de slag te gaan.</p>
        </div>
      </div>

      <!-- Pages Section -->
      <div id="pages" class="section" style="display: none;">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">Pagina's</h2>
            <button class="btn btn-primary" onclick="showPageModal()">Nieuwe Pagina</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Titel</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody id="pages-table"></tbody>
          </table>
        </div>
      </div>

      <!-- Posts Section -->
      <div id="posts" class="section" style="display: none;">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">Artikelen</h2>
            <button class="btn btn-primary" onclick="showPostModal()">Nieuw Artikel</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Titel</th>
                <th>Categorie</th>
                <th>Status</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody id="posts-table"></tbody>
          </table>
        </div>
      </div>

      <!-- Media Section -->
      <div id="media" class="section" style="display: none;">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">Media</h2>
            <button class="btn btn-primary" onclick="showUploadModal()">Upload Media</button>
          </div>
          <div id="media-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;"></div>
        </div>
      </div>

      <!-- Settings Section -->
      <div id="settings" class="section" style="display: none;">
        <div class="card">
          <h2 class="text-2xl font-bold mb-4">Instellingen</h2>
          <form onsubmit="saveSettings(event)">
            <label>Sitenaam</label>
            <input type="text" id="siteName" required>
            
            <label>2FA Status</label>
            <div style="margin: 1rem 0;">
              <button type="button" class="btn btn-secondary" onclick="setup2FA()">2FA Inschakelen</button>
            </div>
            
            <button type="submit" class="btn btn-primary mt-4">Opslaan</button>
          </form>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal for login/2FA -->
  <div id="loginModal" class="modal active">
    <div class="modal-content">
      <h2 class="text-2xl font-bold mb-4">Login</h2>
      <div id="loginForm">
        <form onsubmit="handleLogin(event)">
          <label>Email</label>
          <input type="email" id="email" required>
          
          <label>Wachtwoord</label>
          <input type="password" id="password" required>
          
          <button type="submit" class="btn btn-primary w-full mt-4">Login</button>
        </form>
      </div>
      <div id="twoFAForm" style="display: none;">
        <form onsubmit="handleTwoFA(event)">
          <p style="margin-bottom: 1rem;">Voer jouw 2FA code in:</p>
          <label>2FA Code</label>
          <input type="text" id="twoFACode" placeholder="000000" maxlength="6" required>
          
          <button type="submit" class="btn btn-primary w-full mt-4">Verifiëren</button>
        </form>
      </div>
    </div>
  </div>

  <script>
    let token = localStorage.getItem('cms_token');
    let userId = localStorage.getItem('cms_user_id');

    async function handleLogin(event) {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.status === 202) {
          // 2FA required
          userId = data.userId;
          document.getElementById('loginForm').style.display = 'none';
          document.getElementById('twoFAForm').style.display = 'block';
        } else if (response.ok) {
          token = data.token;
          userId = data.user.id;
          localStorage.setItem('cms_token', token);
          localStorage.setItem('cms_user_id', userId);
          document.getElementById('loginModal').classList.remove('active');
          loadDashboard();
        } else {
          alert('Login failed: ' + data.error);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }

    async function handleTwoFA(event) {
      event.preventDefault();
      const twoFACode = document.getElementById('twoFACode').value;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: document.getElementById('email').value, password: document.getElementById('password').value, twoFACode })
        });

        const data = await response.json();

        if (response.ok) {
          token = data.token;
          userId = data.user.id;
          localStorage.setItem('cms_token', token);
          localStorage.setItem('cms_user_id', userId);
          document.getElementById('loginModal').classList.remove('active');
          loadDashboard();
        } else {
          alert('2FA verification failed: ' + data.error);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }

    async function loadDashboard() {
      if (!token) {
        document.getElementById('loginModal').classList.add('active');
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });

        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        const { user } = await response.json();
        document.getElementById('user-info').textContent = \`Hallo, \${user.username}!\`;
      } catch (error) {
        localStorage.removeItem('cms_token');
        token = null;
        document.getElementById('loginModal').classList.add('active');
      }
    }

    function showSection(sectionName) {
      document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
      document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
      
      if (sectionName === 'dashboard') {
        document.getElementById('dashboard').style.display = 'block';
      } else if (sectionName === 'pages') {
        document.getElementById('pages').style.display = 'block';
        loadPages();
      } else if (sectionName === 'posts') {
        document.getElementById('posts').style.display = 'block';
        loadPosts();
      } else if (sectionName === 'media') {
        document.getElementById('media').style.display = 'block';
        loadMedia();
      } else if (sectionName === 'settings') {
        document.getElementById('settings').style.display = 'block';
      }

      event.target.classList.add('active');
    }

    async function loadPages() {
      try {
        const response = await fetch('/api/pages', {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        const pages = await response.json();
        const table = document.getElementById('pages-table');
        table.innerHTML = pages.map(p => \`
          <tr>
            <td>\${p.title}</td>
            <td>\${p.slug}</td>
            <td>\${p.status}</td>
            <td>
              <button class="btn btn-secondary" onclick="editPage('\${p.id}')">Bewerk</button>
              <button class="btn btn-danger" onclick="deletePage('\${p.id}')">Verwijder</button>
            </td>
          </tr>
        \`).join('');
      } catch (error) {
        console.error('Error loading pages:', error);
      }
    }

    async function loadPosts() {
      try {
        const response = await fetch('/api/posts', {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        const posts = await response.json();
        const table = document.getElementById('posts-table');
        table.innerHTML = posts.map(p => \`
          <tr>
            <td>\${p.title}</td>
            <td>\${p.category}</td>
            <td>\${p.status}</td>
            <td>
              <button class="btn btn-secondary" onclick="editPost('\${p.id}')">Bewerk</button>
              <button class="btn btn-danger" onclick="deletePost('\${p.id}')">Verwijder</button>
            </td>
          </tr>
        \`).join('');
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    }

    async function loadMedia() {
      try {
        const response = await fetch('/api/media', {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        const media = await response.json();
        const grid = document.getElementById('media-grid');
        grid.innerHTML = media.map(m => \`
          <div style="background: #f0f0f0; padding: 1rem; border-radius: 0.375rem; text-align: center;">
            <img src="\${m.url}" alt="\${m.original_name}" style="max-width: 100%; max-height: 120px; margin-bottom: 0.5rem;">
            <p style="font-size: 0.875rem;">\${m.original_name}</p>
          </div>
        \`).join('');
      } catch (error) {
        console.error('Error loading media:', error);
      }
    }

    function logout() {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user_id');
      token = null;
      location.reload();
    }

    function showPageModal() {
      alert('Page creation modal - kom later');
    }

    function showPostModal() {
      alert('Post creation modal - kom later');
    }

    function showUploadModal() {
      alert('Upload modal - kom later');
    }

    function setup2FA() {
      alert('2FA setup - kom later');
    }

    function saveSettings(event) {
      event.preventDefault();
      alert('Instellingen opgeslagen');
    }

    loadDashboard();
  </script>
</body>
</html>`;
}
