import { HttpException } from './http-exception'

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not Found', status: string = 'error') {
    super(message, 404, status)
  }
}
