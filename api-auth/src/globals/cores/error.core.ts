import HTTP_STATUS from '../constants/http.constant';

export abstract class CustomError extends Error {
  abstract status: string;
  abstract statusCode: number;
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.errorCode = errorCode;
  }
}

export class BadRequestException extends CustomError {
  status: string = 'error';
  statusCode: number = HTTP_STATUS.BAD_REQUEST;

  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
  }
}

export class UnAuthorizedException extends CustomError {
  status: string = 'error';
  statusCode: number = HTTP_STATUS.UNAUTHORIZED;

  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
  }
}

export class ForbiddenException extends CustomError {
  status: string = 'error';
  statusCode: number = HTTP_STATUS.FORBIDDEN;

  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
  }
}

export class NotFoundException extends CustomError {
  status: string = 'error';
  statusCode: number = HTTP_STATUS.NOT_FOUND;

  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
  }
}

export class InternalServerError extends CustomError {
  status: string = 'error';
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER;

  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
  }
}
