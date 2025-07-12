import { Request, Response, NextFunction } from 'express'

const trimStrings = (except: string[] = []) => {
  return function (req: Request, res: Response, next: NextFunction) {
    const body = { ...req.body }

    if (typeof body === 'object') {
      for (const k in body) {
        if (typeof body[k] === 'string' && !except.includes(k)) {
          body[k] = body[k].trim()
        }
      }
    }

    req.body = body
    next()
  }
}

export default trimStrings
