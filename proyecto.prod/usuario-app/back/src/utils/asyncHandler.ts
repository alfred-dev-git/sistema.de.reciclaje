import type { Request, Response, NextFunction, RequestHandler } from "express";

// Versión genérica y tipada de async handler
export const asyncHandler = <
  P = any,     // Params
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: (req: Request<P, any, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<any>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
