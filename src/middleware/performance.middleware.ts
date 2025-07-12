import { NextFunction, Request, Response } from 'express'

// Cache middleware for static/meta data
export const cacheMiddleware = (maxAge: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAge}`)
    }
    next()
  }
}
