import { Env } from '../types/index';

export class AuditService {
  constructor(private db: D1Database, private env: Env) {}

  async logAction(
    userId: string | null,
    action: string,
    resourceType?: string,
    resourceId?: string,
    changes?: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.db
      .prepare(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, changes, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        userId,
        action,
        resourceType || null,
        resourceId || null,
        changes ? JSON.stringify(changes) : null,
        ipAddress || null
      )
      .run();
  }

  async getAuditLog(limit: number = 50, offset: number = 0): Promise<any[]> {
    return (await this.db
      .prepare(
        'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?'
      )
      .bind(limit, offset)
      .all()) as unknown as any[];
  }

  async getUserAuditLog(userId: string, limit: number = 20): Promise<any[]> {
    return (await this.db
      .prepare(
        'SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
      )
      .bind(userId, limit)
      .all()) as unknown as any[];
  }
}

export class SettingsService {
  constructor(private db: D1Database, private env: Env) {}

  async getSetting(key: string): Promise<string | null> {
    const result = (await this.db
      .prepare('SELECT value FROM settings WHERE key = ?')
      .bind(key)
      .first()) as any;

    return result?.value || null;
  }

  async setSetting(key: string, value: string, type: string = 'string'): Promise<void> {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if exists
    const existing = await this.db
      .prepare('SELECT id FROM settings WHERE key = ?')
      .bind(key)
      .first();

    if (existing) {
      await this.db
        .prepare(
          'UPDATE settings SET value = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?'
        )
        .bind(value, type, key)
        .run();
    } else {
      await this.db
        .prepare('INSERT INTO settings (id, key, value, type) VALUES (?, ?, ?, ?)')
        .bind(id, key, value, type)
        .run();
    }
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const results = (await this.db
      .prepare('SELECT key, value FROM settings')
      .all()) as unknown as Array<{ key: string; value: string }>;

    const settings: Record<string, string> = {};
    results.forEach(s => {
      settings[s.key] = s.value;
    });
    return settings;
  }

  async deleteSetting(key: string): Promise<void> {
    await this.db.prepare('DELETE FROM settings WHERE key = ?').bind(key).run();
  }
}

export class UtilityService {
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static generateRandomString(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUsername(username: string): boolean {
    // Only alphanumeric and underscore, 3-20 characters
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  }

  static parseQueryParams(url: string): Record<string, string> {
    const params = new URLSearchParams(new URL(url).search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  static sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('nl-NL').format(date);
  }

  static calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }
}
