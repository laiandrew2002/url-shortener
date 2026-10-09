import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof SyntaxError) {
    res.status(400).json({ error: "Request body must be valid JSON." });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Something went wrong." });
}
