import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { usersRepo } from "./store.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-mg69-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (process.env.NODE_ENV === "production" && JWT_SECRET === "dev-mg69-change-me") {
  console.warn("⚠️  JWT_SECRET is using the insecure default in production. Set a strong JWT_SECRET.");
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;
  return bcrypt.compare(password, passwordHash);
}

export function signToken(user) {
  return jwt.sign(
    { sub: String(user._id || user.id), role: user.role || "customer", email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/** Strip sensitive fields before returning a user over the wire. */
export function publicUser(user) {
  if (!user) return null;
  const source = typeof user.toObject === "function" ? user.toObject() : user;
  return {
    id: String(source._id || source.id),
    name: source.name || "",
    email: source.email,
    role: source.role || "customer",
    wishlist: source.wishlist || []
  };
}

function readToken(request) {
  const header = request.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
}

/** Populates request.user when a valid token is present; never rejects. */
export async function attachUser(request, _response, next) {
  const token = readToken(request);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await usersRepo.findById(payload.sub);
    if (user) request.user = publicUser(user);
  } catch {
    // Invalid/expired token — treat as anonymous.
  }
  return next();
}

/** Guards a route, requiring any authenticated user. */
export function requireAuth(request, response, next) {
  if (!request.user) {
    response.status(401).json({ error: "Authentication required." });
    return;
  }
  next();
}

/** Guards a route, requiring an authenticated admin. */
export function requireAdmin(request, response, next) {
  if (!request.user) {
    response.status(401).json({ error: "Authentication required." });
    return;
  }
  if (request.user.role !== "admin") {
    response.status(403).json({ error: "Admin access required." });
    return;
  }
  next();
}

/**
 * Ensures a first admin account exists on startup so the admin dashboard is
 * reachable out of the box. Controlled by ADMIN_EMAIL / ADMIN_PASSWORD.
 */
export async function ensureAdminUser() {
  const email = (process.env.ADMIN_EMAIL || "admin@mg69.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "mg69admin";
  const name = process.env.ADMIN_NAME || "MG69 Admin";

  if (process.env.NODE_ENV === "production" && password === "mg69admin") {
    console.warn("⚠️  ADMIN_PASSWORD is using the insecure default in production. Set a strong ADMIN_PASSWORD.");
  }

  const existing = await usersRepo.findByEmail(email);
  if (existing) {
    if (existing.role !== "admin") {
      await usersRepo.update(existing._id || existing.id, { role: "admin" });
    }
    return;
  }

  await usersRepo.create({ name, email, role: "admin", passwordHash: await hashPassword(password) });
  console.log(`✅ Seeded admin account: ${email}`);
}
