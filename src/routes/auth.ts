import { Router } from 'itty-router';
import { Env, User } from '../types/index';
import { AuthService } from '../services/auth';
import { verifyJWT } from '../utils/jwt';

const router = Router();

// Middleware to verify JWT
export async function verifyAuth(request: Request, env: Env): Promise<User | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  
  if (!payload) {
    return null;
  }

  const authService = new AuthService(env.DB, env);
  return authService.getUserById(payload.userId);
}

// POST /api/auth/register
router.post('/api/auth/register', async (request: Request, env: Env) => {
  try {
    const { email, username, password } = await request.json() as any;

    if (!email || !username || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authService = new AuthService(env.DB, env);
    const user = await authService.register(email, username, password);

    return new Response(JSON.stringify({ user }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({ error: 'Registration failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/auth/login
router.post('/api/auth/login', async (request: Request, env: Env) => {
  try {
    const { email, password, twoFACode } = await request.json() as any;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Missing email or password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authService = new AuthService(env.DB, env);
    const user = await authService.getUserById(email) || 
                 (await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() as User);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check 2FA if enabled
    if (user.two_fa_enabled && twoFACode) {
      const isValid = await authService.verify2FAToken(user.id, twoFACode);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid 2FA code' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else if (user.two_fa_enabled) {
      // Return partial response requiring 2FA
      return new Response(JSON.stringify({ requiresTwoFA: true, userId: user.id }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionToken = await authService.createSession(user.id, request.headers.get('User-Agent') || '');

    return new Response(JSON.stringify({ token: sessionToken, user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// GET /api/auth/me
router.get('/api/auth/me', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return new Response(JSON.stringify({ error: 'Auth check failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/auth/2fa/setup
router.post('/api/auth/2fa/setup', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authService = new AuthService(env.DB, env);
    const setup = await authService.setup2FA(user.id);

    return new Response(JSON.stringify(setup), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return new Response(JSON.stringify({ error: '2FA setup failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/auth/2fa/confirm
router.post('/api/auth/2fa/confirm', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { secret, token, backupCodes } = await request.json() as any;

    if (!secret || !token || !backupCodes) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authService = new AuthService(env.DB, env);
    const success = await authService.confirm2FA(user.id, secret, token, backupCodes);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Invalid 2FA token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: '2FA enabled successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('2FA confirm error:', error);
    return new Response(JSON.stringify({ error: '2FA confirm failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/auth/logout
router.post('/api/auth/logout', async (request: Request, env: Env) => {
  const user = await verifyAuth(request, env);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // In a real app, you'd invalidate the token here
  return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

export default router;
