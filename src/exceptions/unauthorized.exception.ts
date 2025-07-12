import { HttpException } from './http-exception'

export class UnauthorizedException extends HttpException {
  constructor(message: string, status: string = 'error') {
    super(message, 401, status)
  }
}
