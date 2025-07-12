import { HttpException } from './http-exception'

export class TooManyRequestsException extends HttpException {
  constructor(message: string = 'Too Many Requests', status: string = 'error') {
    super(message, 429, status)
  }
}
