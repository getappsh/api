import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';

/**
 * Catch all exceptions and handle RPC exceptions
 * Custom exception filter for RPC exceptions
 */
@Catch()
export class CustomRpcExceptionFilter implements ExceptionFilter {

  private readonly logger = new Logger(CustomRpcExceptionFilter.name);

  catch(exception: RpcException | HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let data: any = {};
    let error: any;
    let error_http_code: number = 500;
    let error_message: string = '';
    let error_stack: string | string[] | undefined;
    // this.logger.error(exception)
    if (typeof exception === 'string') {
      try {
        exception = JSON.parse(exception)
      } catch (error) {
        exception = JSON.parse(JSON.stringify({ message: exception }))
      }
    }

    try {
      error = JSON.parse(exception.message);
    } catch (e) {
      error = exception.message;
    }

    if (exception instanceof RpcException) {
      data = error;
      error_http_code = error.code || 500;
      error_message = error.message || 'Error message not provided';
      error_stack = error.stack || 'Error stack not provided';

    } else if (exception instanceof HttpException) {
      data = exception.getResponse()?.['data'] || exception.getResponse();
      error_http_code = exception.getStatus();

      error_message = exception.getResponse()?.['message']
        ? exception.getResponse()['message']
        : exception.message || 'Error message not provided';
      error_stack = exception.stack;

    } else if (exception instanceof AxiosError) {
      data = exception.response?.data
      error_http_code = exception.response?.status ?? 500;
      error_message = exception.message;
      error_stack = exception.stack;

    } else {
      // Handle generic errors and RPC exceptions from microservices
      error_http_code = 500;
      error_message = exception.message || 'UNKNOWN Internal server error';
      error_stack = exception.stack || [];



      if (typeof error === 'object' && error !== null) {
        if ('errorCode' in error) {
          // Handle error_data from upload microservice with AppError
          if (error.error_data && typeof error.error_data === 'object' && 'data' in error.error_data) {
            // Only extract the nested data property, not the entire error_data object
            data = error.error_data.data;
          }
          error_http_code = error.code || 500;
          error_message = error.message ?? error.errorCode ?? 'Unknown error';
          error_stack = error.stack;
        } else {
          // Handle other structured errors
          if ('stack' in error) {
            error_stack = `${error.stack}`;
          }

          if ('code' in error) {
            error_http_code = error.code;
          }

          if ('error_data' in error) {
              data = error.error_data;
          }

          if ('message' in error) {
            error_message = error.message;
          }
        }
      }
    }
    this.logger.error(`${error_message}`, error_stack);

    try {
      response.status(error_http_code).json({
        name: exception.name,
        statusCode: error_http_code,
        message: error_message,
        errorCode: error?.errorCode,
        data: data,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } catch (e) {
      // Maybe details are not in json format, send simple text
      response.status(500).json({
        statusCode: 500,
        message: error_message,
        // stack: error_stack,
        // data: data,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}