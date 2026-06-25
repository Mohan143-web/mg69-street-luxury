import express from "express";
import { subscribersRepo } from "../store.js";

const router = express.Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Capture an early-access email. Public, idempotent (dedupes by email).
router.post("/", async (request, response) => {
  const email = String(request.body?.email || "").trim();
  if (!emailPattern.test(email)) {
    response.status(400).json({ error: "Enter a valid email address." });
    return;
  }
  const source = String(request.body?.source || "early-access").slice(0, 60);
  const result = await subscribersRepo.add(email, source);
  response.status(201).json({ ok: true, alreadyOn: !result.created });
});

// Public count — used for social proof on the early-access page.
router.get("/count", async (_request, response) => {
  response.json({ count: await subscribersRepo.count() });
});

export default router;
