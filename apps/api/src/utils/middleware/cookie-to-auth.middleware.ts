import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Extracts the accessToken cookie and injects it as an Authorization: Bearer header.
 * Must run before guards, which is guaranteed by NestJS middleware-first execution order.
 * This allows cookie-based browser requests to pass the same guard chain as header-based requests.
 */
@Injectable()
export class CookieToAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Normalize 'Authorization' (capital A) → 'authorization'.
    // Node.js lowercases headers for real HTTP requests, but programmatic callers
    // (axios defaults, internal forwarding, test utilities) commonly use capital-A.
    if (req.headers['Authorization']) {
      req.headers['authorization'] = req.headers['Authorization'] as string;
      delete req.headers['Authorization'];
    }

    if (!req.headers['authorization'] && req.headers.cookie) {
      const token = this.extractCookieValue(req.headers.cookie, 'accessToken');
      if (token) {
        req.headers['authorization'] = `Bearer ${token}`;
      }
    }
    next();
  }

  private extractCookieValue(cookieString: string, name: string): string {
    const prefix = name + '=';
    for (const part of cookieString.split(';')) {
      const trimmed = part.trimStart();
      if (trimmed.startsWith(prefix)) return trimmed.substring(prefix.length);
    }
    return '';
  }
}
