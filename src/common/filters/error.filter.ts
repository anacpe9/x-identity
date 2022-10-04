import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus } from '@nestjs/common';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    if (Array.isArray(error) && error.length > 0 && error[0]['constraints']) {
      const arr = [];
      for (const err of error) {
        const kv = Object.entries(err.constraints);
        arr.push(...kv.map((kk) => kk[1]));
      }
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: arr[0],
        error: 'ValidationError',
        errors: arr,
      });
    }

    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    return response.status(status).json({
      statusCode: status,
      message: error.message,
      error: error.name,
    });
    // if (status === HttpStatus.UNAUTHORIZED) return response.status(status).send(message);
    // if (status === HttpStatus.NOT_FOUND) return response.status(status).send(message);
    // if (status === HttpStatus.BAD_REQUEST) return response.status(status).send(message);
    // if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
    //   return response.status(status).send(message);
    //   //   if (process.env.NODE_ENV === 'production') {
    //   //     console.error(error.stack);
    //   //     return response.status(status);
    //   //   } else {
    //   //     const message = error.stack;
    //   //     return response.status(status).send(message);
    //   //   }
    // }
  }
}
