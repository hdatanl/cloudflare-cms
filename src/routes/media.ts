import { Router } from 'itty-router';
import { Env } from '../types/index';
import { MediaService } from '../services/media';
import { verifyAuth } from './auth';

const router = Router();

// GET /api/media
router.get('/api/media', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const mediaService = new MediaService(env.STORAGE, env.DB, env);
    const media = await mediaService.getAllMedia(limit, offset);

    return new Response(JSON.stringify(media), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get media error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// GET /api/media/search
router.get('/api/media/search', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mediaService = new MediaService(env.STORAGE, env.DB, env);
    const results = await mediaService.searchMedia(query);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search media error:', error);
    return new Response(JSON.stringify({ error: 'Failed to search media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/media/upload
router.post('/api/media/upload', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user || user.role === 'viewer') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const altText = (formData.get('altText') || '') as string;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = await file.arrayBuffer();
    const mediaService = new MediaService(env.STORAGE, env.DB, env);
    const media = await mediaService.uploadFile(
      buffer,
      file.name,
      file.type,
      user.id,
      altText
    );

    return new Response(JSON.stringify(media), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload media error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// PUT /api/media/:id
router.put('/api/media/:id', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = request.params as any;
    const { altText } = await request.json() as any;

    const mediaService = new MediaService(env.STORAGE, env.DB, env);
    const media = await mediaService.updateMediaAltText(id, altText);

    return new Response(JSON.stringify(media), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update media error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// DELETE /api/media/:id
router.delete('/api/media/:id', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = request.params as any;
    const mediaService = new MediaService(env.STORAGE, env.DB, env);
    await mediaService.deleteMedia(id);

    return new Response(JSON.stringify({ message: 'Media deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete media error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

export default router;
