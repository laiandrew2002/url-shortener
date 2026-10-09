import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { getRateLimitMax } from "../lib/config.js";
import { AppError } from "../lib/errors.js";
import { createUrlBodySchema } from "../services/url-validation.js";
import { shortenUrl } from "../services/urls.js";

export function createUrlsRouter() {
  const router = Router();
  const limit = getRateLimitMax();

  router.post(
    "/api/urls",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: limit === 0 ? 1 : limit,
      skip: () => limit === 0,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests. Please try again later." },
    }),
    async (req, res, next) => {
      try {
        const parsed = createUrlBodySchema.safeParse(req.body);

        if (!parsed.success) {
          throw new AppError(400, "Enter a valid HTTP or HTTPS URL.");
        }

        const shortened = await shortenUrl(parsed.data.url);
        res.status(201).json(shortened);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
