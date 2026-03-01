import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class VersionManagementMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {

    const firstPathSegment = req.originalUrl
      .split('/')[2]
      ?.toString()
      ?.toLowerCase();

    const versionPattern = /^v\d+/;

    if (!versionPattern.test(firstPathSegment)) {
      req.url = req.originalUrl.replace("/api/", '/v1/')


    }
    next();
  }
}