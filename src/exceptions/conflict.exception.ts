import { HttpException } from './http-exception'

export class ConflictException extends HttpException {
  constructor(message: string, status: string = 'error') {
    super(message, 409, status)
  }
}
