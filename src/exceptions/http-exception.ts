export class HttpException extends Error {
  public code: number
  public status: string

  constructor(message: string, code: number, status: string = 'error') {
    super(message)
    this.code = code
    this.status = status
  }
}
