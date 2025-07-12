import { HttpException } from './http-exception'

export class UnprocessableContentException extends HttpException {
  public errors: object
  constructor(message: string, status: string = 'error', errors: object) {
    super(message, 422, status)
    this.errors = errors
  }
}
