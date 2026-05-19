import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RequestHandler, createProxyMiddleware } from "http-proxy-middleware";
import { ClientRequest } from "http";
import { IncomingMessage } from "http";
import { Request, Response } from "express";
import { ClsService } from "nestjs-cls";
import * as fs from "fs";

/**
 * TEMPORARY SOLUTION — Serving GetMap through GetApp.
 *
 * Proxies all `/map/*` HTTP requests to the GetMap server's API Gateway.
 * This is needed because GetMap and GetApp are currently separate deployments
 * (develop-z and develop branches), and we want all agent traffic to go
 * through the GetApp server only.
 *
 * Activated only when `GETMAP_SERVER_URL` env var is set AND `IS_PROXY` is not "true".
 * On proxy (edge) servers, all requests already go to the origin via ProxyMiddleware,
 * and the origin handles the GetMap proxy.
 *
 * Supports two modes:
 * - Plain HTTP (default): GETMAP_SERVER_URL=http://getmap:3000
 * - mTLS (mutual TLS): GETMAP_MTLS=true + certificate env vars.
 *   mTLS = both sides verify each other's certificate. Required when the
 *   GetMap server is on a different network/cluster and demands client cert auth.
 *   When both servers are in the same cluster, mTLS is NOT needed.
 *
 * TODO: Remove this middleware once GetMap is fully integrated into the GetApp server.
 */
@Injectable()
export class GetMapProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(GetMapProxyMiddleware.name);
  private readonly proxy: RequestHandler;

  constructor(configService: ConfigService, private cls: ClsService) {
    const getMapServerUrl = configService.get<string>("GETMAP_SERVER_URL");
    const useMtls = configService.get<string>("GETMAP_MTLS") === "true";

    if (useMtls) {
      // mTLS mode: GetMap server requires mutual certificate authentication.
      // Same pattern as the existing ProxyMiddleware secure mode.
      const key = fs.readFileSync(configService.get("GETMAP_CLIENT_KEY_PATH") || configService.get("CLIENT_KEY_PATH") || "").toString();
      const cert = fs.readFileSync(configService.get("GETMAP_CLIENT_CERT_PATH") || configService.get("CLIENT_CERT_PATH") || "").toString();
      const ca = fs.readFileSync(configService.get("GETMAP_CA_CERT_PATH") || configService.get("CA_CERT_PATH") || "").toString();

      this.logger.log(`GetMap proxy configured in mTLS mode, target: ${getMapServerUrl}`);
      this.proxy = createProxyMiddleware({
        target: getMapServerUrl,
        changeOrigin: true,
        secure: true,
        ssl: { key, cert, ca },
        onProxyReq: this.onProxyReq.bind(this),
        onProxyRes: this.onProxyRes.bind(this),
        onError: this.onError.bind(this),
      });
    } else {
      // Plain HTTP mode: same cluster, no certificate needed.
      this.logger.log(`GetMap proxy configured in plain HTTP mode, target: ${getMapServerUrl}`);
      this.proxy = createProxyMiddleware({
        target: getMapServerUrl,
        changeOrigin: true,
        onProxyReq: this.onProxyReq.bind(this),
        onProxyRes: this.onProxyRes.bind(this),
        onError: this.onError.bind(this),
      });
    }
  }

  use(req: any, res: any, next: (error?: Error | any) => void) {
    this.proxy(req, res, next);
  }

  private onProxyReq(proxyReq: ClientRequest, req: Request, _res: Response) {
    const traceId = this.cls.getId();
    if (traceId) {
      proxyReq.setHeader("x-request-id", traceId);
    }
    this.logger.debug(`GetMap proxy → ${req.method} ${req.originalUrl}`);
  }

  private onProxyRes(proxyRes: IncomingMessage, req: Request, _res: Response) {
    this.logger.debug(`GetMap proxy ← ${req.originalUrl} [${proxyRes.statusCode}]`);
  }

  private onError(error: any, req: Request, res: Response) {
    this.logger.error(`GetMap proxy error for ${req.originalUrl}: ${error.message}`);
    if (!res.headersSent) {
      res.status(502).json({
        error: "GetMap server unavailable",
        message: error.message,
      });
    }
  }
}
