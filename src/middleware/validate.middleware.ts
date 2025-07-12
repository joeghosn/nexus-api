import { NextFunction, Request, Response } from 'express'
import { UnprocessableContentException } from '../exceptions/unprocessable-content.exception'
import { ZodIssue, ZodSchema } from 'zod'
import { ParamsDictionary, Query } from 'express-serve-static-core'

type Path = 'body' | 'query' | 'params'

const prettify = (issues: ZodIssue[]) =>
  issues.map((issue) => ({
    path: issue.path[0],
    error: issue.message,
  }))

const build = (path: Path, schema: ZodSchema, whitelist?: boolean) => {
  return async function <
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = Query,
  >(
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response,
    next: NextFunction,
  ) {
    const parsed = await schema.safeParseAsync(req[path])

    if (!parsed.success) {
      const errors = prettify(parsed.error.issues)
      throw new UnprocessableContentException(
        'Validation Error',
        'error',
        errors,
      )
    }

    const value = whitelist ? parsed.data : req[path]
    Object.defineProperty(req, path, { value })

    next()
  }
}

const validate = {
  body: (schema: ZodSchema, whitelist = true) =>
    build('body', schema, whitelist),
  query: (schema: ZodSchema, whitelist = true) =>
    build('query', schema, whitelist),
  params: (schema: ZodSchema, whitelist = true) =>
    build('params', schema, whitelist),
}

export default validate
