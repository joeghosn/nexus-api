import { HttpException } from '@/exceptions/http-exception'
import { NextFunction, Request, Response } from 'express'
import { ErrorResponse } from '@/types/response.types'
import { UnprocessableContentException } from '@/exceptions/unprocessable-content.exception'

const errorHandler = (
  err: HttpException | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500
  let status = 'error'
  let message = 'Internal Server Error'

  console.error('🚨 Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  })

  if (err instanceof HttpException) {
    statusCode = err.code
    status = err.status
    message = err.message
  }

  const response = {
    status,
    message,
    statusCode,

    ...(err instanceof UnprocessableContentException && { errors: err.errors }),
  }

  res.status(response.statusCode).json(response)
}

export default errorHandler
