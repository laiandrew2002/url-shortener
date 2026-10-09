import { Router } from "express";
import { findUrlByShortCode } from "../services/urls.js";
import { isValidShortCode } from "../services/short-code.js";

export const redirectRouter = Router();

redirectRouter.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code ?? "";

    if (!isValidShortCode(code)) {
      res.status(404).json({ error: "Short URL not found." });
      return;
    }

    const mapping = await findUrlByShortCode(code);

    if (!mapping) {
      res.status(404).json({ error: "Short URL not found." });
      return;
    }

    res.redirect(302, mapping.originalUrl);
  } catch (error) {
    next(error);
  }
});
