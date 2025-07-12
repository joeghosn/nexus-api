import { HttpException } from './http-exception'

export class ForbiddenException extends HttpException {
  constructor(message: string, status: string = 'error') {
    super(message, 403, status)
  }
}
