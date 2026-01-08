import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

type ErrorResponse = {
  message?: string | string[];
  errors?: Record<string, unknown> | string[];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errors: Record<string, unknown> | string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const payload = exceptionResponse as ErrorResponse;
        message = payload.message ?? message;
        errors = payload.errors;
      } else {
        message = String(exceptionResponse);
      }
    }

    response.status(status).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
