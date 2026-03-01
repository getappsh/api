import { HttpException, HttpStatus, Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RequestHandler, createProxyMiddleware } from "http-proxy-middleware";
import * as fs from "fs";
import { Request, Response } from "express";
import { TLSSocket } from "tls";
import { HttpClientService } from "./http-client.service";
import { ProxyHttpConfigService } from "@app/common/http-config/http-config.service";
import { ClientRequest } from "http";
import { IncomingMessage } from "http";
import * as https from 'https'
import { ClsService } from "nestjs-cls";

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyMiddleware.name);
  private readonly proxy: RequestHandler;

  isSecureMode = process.env.HTTP_PROTOCOL === "true"
  isDistSecureMode = process.env.DIST_HTTP_PROTOCOL === "true"
  validateTLS = (process.env.PROXY_SECURE_TLS ?? "true") === "true"

  constructor(
    private httpConfig: ProxyHttpConfigService,
    private httpService: HttpClientService,
    configService: ConfigService,
    private cls: ClsService
  ) {
    if (this.isDistSecureMode) {
      this.logger.log("Proxy configured in secure mode");
      const key = fs.readFileSync(configService.get("CLIENT_KEY_PATH") || "").toString()
      const cert = fs.readFileSync(configService.get("CLIENT_CERT_PATH") || "").toString()
      const ca = fs.readFileSync(configService.get("CA_CERT_PATH") || "").toString()

      this.proxy = createProxyMiddleware({
        target: {
          protocol: "https:",
          host: configService.get("GETAPP_SSL_URL") || "",
          port: Number(configService.get("GETAPP_SSL_PORT")),
        },
        secure: this.validateTLS,
        ssl: { key, cert, ca },
        onProxyReq: this.onProxyReq.bind(this),
        onProxyRes: this.onProxyRes.bind(this),
        onError: this.onError.bind(this),
      });
    } else {
      const getAppUrl = configService.get<string>("GETAPP_URL")
      let agent: https.Agent | undefined = undefined;
      if (getAppUrl && getAppUrl.startsWith("https") && configService.get("NODE_EXTRA_CA_CERTS")) {
        const extraCa = fs.readFileSync(configService.get("NODE_EXTRA_CA_CERTS") || "");
        agent = new https.Agent({
          ca: extraCa,
        })
      }

      this.logger.log("Proxy configured in unsecure mode");
      this.proxy = createProxyMiddleware({
        target: getAppUrl,
        agent,
        changeOrigin: true,
        secure: this.validateTLS,
        onProxyReq: this.onProxyReq.bind(this),
        onProxyRes: this.onProxyRes.bind(this),
        onError: this.onError.bind(this),
      });
    }
  }

  use(req: any, res: any, next: (error?: Error | any) => void) {
    this.proxy(req, res, next)
  }

  async onProxyReq(proxyReq: ClientRequest, req: Request, res: Response,) {
    const socket = req.socket as TLSSocket;

    const traceId = this.cls.getId();
    proxyReq.setHeader("x-request-id", traceId);

    if (!this.isSecureMode || socket.authorized) {
      if (socket.authorized) {
        if (this.isDistSecureMode) {
          // req.headers = { ...req.headers, "auth_type": "CC" }
          proxyReq.setHeader("auth_type", "CC")
        } else {
          const headers = this.httpConfig.getDeviceAuthHeader()
          for (const [key, value] of Object.entries(headers.headers)) {
            proxyReq.setHeader(key, value as string);
          }
        }
      } else {
        const headers = this.httpConfig.getDeviceAuthHeader()
        for (const [key, value] of Object.entries(headers.headers)) {
          proxyReq.setHeader(key, value as string);
        }
      }
      this.logger.debug(`Proxy Middleware routes the end-point: ${proxyReq.path}`);
    }
    else {
      const deviceId = req.header("DeviceId")
      this.logger.debug(`Agent with device id ${deviceId} in not authorized`)
      const body = {
        deviceId,
        status: socket.authorizationError ? socket.authorizationError : "unknown error"
      }
      this.httpService.setTlsStatus(body)
      throw new HttpException(socket.authorizationError, HttpStatus.UNAUTHORIZED)
    }
  }

  private onProxyRes(proxyRes: IncomingMessage, req: Request, res: Response) {
    this.logger.debug(`Response from '${req.originalUrl}' received with status: ${proxyRes.statusCode}`);
  }


  private onError(error: any, req: Request, res: Response) {
    this.logger.error(`Proxy error: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).json({ errMsg: `Proxy encountered an error: ${error.toString()} ` });
    }
  }
}