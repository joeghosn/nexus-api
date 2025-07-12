import { HttpException } from './http-exception'

export class BadRequestException extends HttpException {
  constructor(message: string, status: string = 'error') {
    super(message, 400, status)
  }
}
