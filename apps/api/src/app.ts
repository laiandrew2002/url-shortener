import cors from "cors";
import express from "express";
import { errorHandler } from "./lib/error-handler.js";
import { healthRouter } from "./routes/health.js";
import { redirectRouter } from "./routes/redirect.js";
import { createUrlsRouter } from "./routes/urls.js";

export function createApp() {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL?.trim();

  app.disable("x-powered-by");

  if (frontendUrl) {
    app.use(cors({ origin: frontendUrl }));
  }

  app.use(express.json());
  app.use(healthRouter);
  app.use(createUrlsRouter());
  app.use(redirectRouter);
  app.use(errorHandler);

  return app;
}
