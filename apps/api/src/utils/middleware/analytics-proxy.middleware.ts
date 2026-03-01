import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RequestHandler, createProxyMiddleware } from "http-proxy-middleware";
import * as fs from "fs";
import { Request, Response } from "express";
import * as https from 'https'


@Injectable()
export class AnalyticsProxy implements NestMiddleware {
  private readonly logger = new Logger(AnalyticsProxy.name);
  private readonly proxy: RequestHandler;

  validateTLS = (process.env.PROXY_SECURE_TLS ?? "true") === "true"

  constructor(configService: ConfigService) {
    const target = configService.get<string>("ANALYTICS_SERVER_URL")
    let agent: https.Agent | undefined = undefined;
    if (target && target.startsWith("https") && configService.get("NODE_EXTRA_CA_CERTS")) {
      const extraCa = fs.readFileSync(configService.get("NODE_EXTRA_CA_CERTS") ?? "");
      agent = new https.Agent({
        ca: extraCa,
      })
    }

    this.logger.log("Proxy configured in unsecure mode"); this.proxy = createProxyMiddleware({
      target,
      agent,
      changeOrigin: true,
      secure: this.validateTLS,
      onError: this.onError.bind(this),
    });
  }

  use(req: any, res: any, next: (error?: Error | any) => void) {
    this.logger.debug(`Analytics proxy Middleware routes the end-point: ${req.baseUrl}`)
    this.proxy(req, res, next)
  }


  private onError(error: any, req: Request, res: Response) {
    this.logger.error(`Proxy error: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).json({ errMsg: `Proxy encountered an error: ${error.toString()} ` });
    }
  }
}