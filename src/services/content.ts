import { Env, Page, Post } from '../types/index';
import { generateId, slugify } from '../utils/crypto';

export class ContentService {
  constructor(private db: D1Database, private env: Env) {}

  // ===== PAGES =====
  async createPage(
    title: string,
    slug: string,
    content: string,
    authorId: string,
    meta?: {
      excerpt?: string;
      meta_description?: string;
      meta_keywords?: string;
      featured_image?: string;
    }
  ): Promise<Page> {
    const id = generateId();
    const normalizedSlug = slugify(slug || title);

    await this.db
      .prepare(
        `INSERT INTO pages (id, title, slug, content, excerpt, meta_description, meta_keywords, featured_image, author_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        title,
        normalizedSlug,
        content,
        meta?.excerpt || '',
        meta?.meta_description || '',
        meta?.meta_keywords || '',
        meta?.featured_image || '',
        authorId
      )
      .run();

    return this.getPageById(id) as Promise<Page>;
  }

  async updatePage(
    id: string,
    updates: Partial<Omit<Page, 'id' | 'author_id' | 'created_at'>>
  ): Promise<Page> {
    const sets: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'author_id' && key !== 'created_at') {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (sets.length === 0) {
      return this.getPageById(id) as Promise<Page>;
    }

    sets.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.prepare(`UPDATE pages SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run();

    return this.getPageById(id) as Promise<Page>;
  }

  async getPageById(id: string): Promise<Page | null> {
    return (await this.db
      .prepare('SELECT * FROM pages WHERE id = ?')
      .bind(id)
      .first()) as Page | null;
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    return (await this.db
      .prepare('SELECT * FROM pages WHERE slug = ?')
      .bind(slug)
      .first()) as Page | null;
  }

  async getPages(status?: string, limit: number = 20, offset: number = 0): Promise<Page[]> {
    let query = 'SELECT * FROM pages';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return (await this.db.prepare(query).bind(...params).all()) as unknown as Page[];
  }

  async deletePage(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM pages WHERE id = ?').bind(id).run();
  }

  async publishPage(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE pages SET status = ?, published_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind('published', id)
      .run();
  }

  // ===== POSTS =====
  async createPost(
    title: string,
    slug: string,
    content: string,
    category: string,
    authorId: string,
    meta?: {
      excerpt?: string;
      meta_description?: string;
      meta_keywords?: string;
      featured_image?: string;
    }
  ): Promise<Post> {
    const id = generateId();
    const normalizedSlug = slugify(slug || title);

    await this.db
      .prepare(
        `INSERT INTO posts (id, title, slug, content, excerpt, meta_description, meta_keywords, featured_image, category, author_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        title,
        normalizedSlug,
        content,
        meta?.excerpt || '',
        meta?.meta_description || '',
        meta?.meta_keywords || '',
        meta?.featured_image || '',
        category,
        authorId
      )
      .run();

    return this.getPostById(id) as Promise<Post>;
  }

  async updatePost(
    id: string,
    updates: Partial<Omit<Post, 'id' | 'author_id' | 'created_at'>>
  ): Promise<Post> {
    const sets: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'author_id' && key !== 'created_at') {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (sets.length === 0) {
      return this.getPostById(id) as Promise<Post>;
    }

    sets.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.prepare(`UPDATE posts SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run();

    return this.getPostById(id) as Promise<Post>;
  }

  async getPostById(id: string): Promise<Post | null> {
    return (await this.db
      .prepare('SELECT * FROM posts WHERE id = ?')
      .bind(id)
      .first()) as Post | null;
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    return (await this.db
      .prepare('SELECT * FROM posts WHERE slug = ?')
      .bind(slug)
      .first()) as Post | null;
  }

  async getPosts(
    category?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Post[]> {
    let query = 'SELECT * FROM posts WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return (await this.db.prepare(query).bind(...params).all()) as unknown as Post[];
  }

  async deletePost(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  }

  async publishPost(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE posts SET status = ?, published_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind('published', id)
      .run();
  }

  async getPostsByCategory(category: string, limit: number = 10): Promise<Post[]> {
    return (await this.db
      .prepare('SELECT * FROM posts WHERE category = ? AND status = ? ORDER BY published_at DESC LIMIT ?')
      .bind(category, 'published', limit)
      .all()) as unknown as Post[];
  }
}
