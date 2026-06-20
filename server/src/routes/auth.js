import express from "express";
import { hashPassword, publicUser, requireAuth, signToken, verifyPassword } from "../auth.js";
import { usersRepo } from "../store.js";

const router = express.Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (request, response) => {
  const { name, email, password } = request.body || {};

  if (!emailPattern.test(String(email || ""))) {
    response.status(400).json({ error: "A valid email is required." });
    return;
  }
  if (!password || String(password).length < 8) {
    response.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  const existing = await usersRepo.findByEmail(email);
  if (existing) {
    response.status(409).json({ error: "An account with that email already exists." });
    return;
  }

  const user = await usersRepo.create({
    name: String(name || "").trim(),
    email,
    role: "customer",
    passwordHash: await hashPassword(String(password))
  });

  response.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post("/login", async (request, response) => {
  const { email, password } = request.body || {};
  const user = await usersRepo.findByEmail(email);

  if (!user || !(await verifyPassword(String(password || ""), user.passwordHash))) {
    response.status(401).json({ error: "Invalid email or password." });
    return;
  }

  response.json({ token: signToken(user), user: publicUser(user) });
});

router.get("/me", requireAuth, (request, response) => {
  response.json({ user: request.user });
});

// Persist a customer's wishlist (array of product slug ids) server-side.
router.put("/me/wishlist", requireAuth, async (request, response) => {
  const wishlist = Array.isArray(request.body?.wishlist) ? request.body.wishlist.map(String) : [];
  const updated = await usersRepo.update(request.user.id, { wishlist });
  response.json({ user: publicUser(updated) });
});

export default router;
