import { HttpException } from './http-exception'

export class InternalServerErrorException extends HttpException {
  constructor(message: string, status: string = 'error') {
    super(message, 500, status)
  }
}
