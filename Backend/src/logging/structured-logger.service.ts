import { Injectable, Logger, LogLevel, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { RequestContext } from './request-context';

/**
 * A Nest logger implementation that emits JSON with a consistent schema and
 * automatically injects the current correlation id when available.
 *
 * Most services should inject the logger via DI instead of calling `new Logger()`
 * so that the global instance is used and context/correlation IDs are available.
 */
@Injectable()
export class StructuredLogger extends Logger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    super();

    const formats = [
      winston.format.timestamp(),
      winston.format.printf(info => {
        const correlationId = RequestContext.get('correlationId');
        const base: any = {
          timestamp: info.timestamp,
          level: info.level,
          message: info.message,
          correlationId,
          context: info.context || this.context,
          ...(info.meta || {}),
        };
        return JSON.stringify(base);
      }),
    ];

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(...formats),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: any, context?: string): any {
    this.logger.info(message, { context });
  }
  error(message: any, trace?: string, context?: string): any {
    this.logger.error(message, { trace, context });
  }
  warn(message: any, context?: string): any {
    this.logger.warn(message, { context });
  }
  debug(message: any, context?: string): any {
    this.logger.debug(message, { context });
  }
  verbose(message: any, context?: string): any {
    this.logger.verbose(message, { context });
  }
}
