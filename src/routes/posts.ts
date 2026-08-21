import { Router } from 'itty-router';
import { Env } from '../types/index';
import { ContentService } from '../services/content';
import { verifyAuth } from './auth';

const router = Router();

// GET /api/posts
router.get('/api/posts', async (request: Request, env: Env) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const contentService = new ContentService(env.DB, env);
    const posts = await contentService.getPosts(category || undefined, status, limit, offset);

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// GET /api/posts/:slug
router.get('/api/posts/:slug', async (request: Request, env: Env) => {
  try {
    const { slug } = request.params as any;
    const contentService = new ContentService(env.DB, env);
    const post = await contentService.getPostBySlug(slug);

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get post error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/posts
router.post('/api/posts', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user || user.role === 'viewer') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { title, slug, content, category, excerpt, meta_description, meta_keywords, featured_image } =
      await request.json() as any;

    if (!title || !content || !category) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contentService = new ContentService(env.DB, env);
    const post = await contentService.createPost(title, slug, content, category, user.id, {
      excerpt,
      meta_description,
      meta_keywords,
      featured_image,
    });

    return new Response(JSON.stringify(post), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create post error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// PUT /api/posts/:id
router.put('/api/posts/:id', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user || user.role === 'viewer') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = request.params as any;
    const updates = await request.json() as any;

    const contentService = new ContentService(env.DB, env);
    const post = await contentService.updatePost(id, updates);

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update post error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// DELETE /api/posts/:id
router.delete('/api/posts/:id', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = request.params as any;
    const contentService = new ContentService(env.DB, env);
    await contentService.deletePost(id);

    return new Response(JSON.stringify({ message: 'Post deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/posts/:id/publish
router.post('/api/posts/:id/publish', async (request: Request, env: Env) => {
  try {
    const user = await verifyAuth(request, env);

    if (!user || user.role === 'viewer') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = request.params as any;
    const contentService = new ContentService(env.DB, env);
    await contentService.publishPost(id);

    return new Response(JSON.stringify({ message: 'Post published' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Publish post error:', error);
    return new Response(JSON.stringify({ error: 'Failed to publish post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// GET /api/posts/category/:category
router.get('/api/posts/category/:category', async (request: Request, env: Env) => {
  try {
    const { category } = request.params as any;
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '10', 10);

    const contentService = new ContentService(env.DB, env);
    const posts = await contentService.getPostsByCategory(category, limit);

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get category posts error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get category posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

export default router;
