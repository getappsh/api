
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogRequestBodyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LogRequestBodyMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.verbose(`Request Body: ${JSON.stringify(req.body)}`);
    next();
  }
}