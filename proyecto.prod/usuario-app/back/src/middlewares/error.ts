import { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = (err as any)?.status || 500;
  const message = (err as any)?.message || "Internal Server Error";
  res.status(status).json({ error: message });
};
