import crypto from "node:crypto";
import mongoose from "mongoose";
import { fallbackProducts } from "./data/fallbackProducts.js";
import { Order } from "./models/Order.js";
import { Product } from "./models/Product.js";
import { Subscriber } from "./models/Subscriber.js";
import { User } from "./models/User.js";

/**
 * Data layer for the MG69 API.
 *
 * Every repository exposes the same interface regardless of backing store:
 *   - when MongoDB is connected (MONGODB_URI set), it reads/writes Mongoose models;
 *   - otherwise it falls back to an in-memory store seeded from fallbackProducts.
 *
 * This keeps the whole API runnable and testable with zero external services,
 * while staying production-ready the moment an Atlas connection is provided.
 */

export const dbConnected = () => mongoose.connection.readyState === 1;

const newId = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

// Deep-clone the seed so in-memory mutations never touch the imported constant.
const memory = {
  products: fallbackProducts.map((product) => ({
    ...structuredClone(product),
    _id: product.id || newId()
  })),
  orders: [],
  users: [],
  subscribers: []
};

function matchProduct(product, { category, collection } = {}) {
  if (product.active === false) return false;
  if (category && category !== "All" && product.category !== category) return false;
  if (collection && collection !== "All" && product.collection !== collection) return false;
  return true;
}

async function findProductDoc(id) {
  if (mongoose.isValidObjectId(id)) {
    const byObjectId = await Product.findById(id);
    if (byObjectId) return byObjectId;
  }
  return Product.findOne({ id });
}

function memProductIndex(id) {
  return memory.products.findIndex(
    (product) => String(product._id) === String(id) || product.id === id
  );
}

export const productsRepo = {
  async list(filter = {}) {
    if (dbConnected()) {
      const query = { active: true };
      if (filter.category && filter.category !== "All") query.category = filter.category;
      if (filter.collection && filter.collection !== "All") query.collection = filter.collection;
      return Product.find(query).sort({ createdAt: -1 }).lean();
    }
    return memory.products.filter((product) => matchProduct(product, filter));
  },

  async findById(id) {
    if (dbConnected()) {
      const doc = await findProductDoc(id);
      return doc ? doc.toObject() : null;
    }
    const index = memProductIndex(id);
    return index === -1 ? null : memory.products[index];
  },

  async create(data) {
    const payload = { ...data, active: data.active !== false };
    if (dbConnected()) {
      const doc = await Product.create({ ...payload, id: payload.id || newId() });
      return doc.toObject();
    }
    const doc = {
      ...payload,
      _id: newId(),
      id: payload.id || newId(),
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    memory.products.unshift(doc);
    return doc;
  },

  async update(id, updates) {
    if (dbConnected()) {
      const doc = await findProductDoc(id);
      if (!doc) return null;
      Object.assign(doc, updates);
      await doc.save();
      return doc.toObject();
    }
    const index = memProductIndex(id);
    if (index === -1) return null;
    memory.products[index] = { ...memory.products[index], ...updates, updatedAt: nowIso() };
    return memory.products[index];
  },

  async remove(id) {
    if (dbConnected()) {
      const doc = await findProductDoc(id);
      if (!doc) return false;
      await doc.deleteOne();
      return true;
    }
    const index = memProductIndex(id);
    if (index === -1) return false;
    memory.products.splice(index, 1);
    return true;
  },

  async count() {
    if (dbConnected()) return Product.countDocuments({});
    return memory.products.length;
  },

  async seed(items) {
    if (dbConnected()) {
      await Product.deleteMany({});
      const docs = await Product.insertMany(items);
      return docs.map((doc) => doc.toObject());
    }
    memory.products = items.map((product) => ({
      ...structuredClone(product),
      _id: product.id || newId()
    }));
    return memory.products;
  }
};

export const usersRepo = {
  // Includes passwordHash (schema select:false) because callers verify the password.
  // Responses are always built via publicUser(), which strips it.
  async findByEmail(email) {
    const normalized = String(email || "").toLowerCase().trim();
    if (!normalized) return null;
    if (dbConnected()) return User.findOne({ email: normalized }).select("+passwordHash");
    return memory.users.find((user) => user.email === normalized) || null;
  },

  async findById(id) {
    if (dbConnected()) return User.findById(id);
    return memory.users.find((user) => String(user._id) === String(id)) || null;
  },

  async create(data) {
    const email = String(data.email || "").toLowerCase().trim();
    if (dbConnected()) return User.create({ ...data, email });
    const doc = {
      ...data,
      email,
      _id: newId(),
      role: data.role || "customer",
      wishlist: data.wishlist || [],
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    memory.users.push(doc);
    return doc;
  },

  async update(id, updates) {
    if (dbConnected()) return User.findByIdAndUpdate(id, updates, { new: true });
    const user = memory.users.find((candidate) => String(candidate._id) === String(id));
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: nowIso() });
    return user;
  },

  async count() {
    if (dbConnected()) return User.countDocuments({});
    return memory.users.length;
  }
};

export const ordersRepo = {
  async list() {
    if (dbConnected()) return Order.find().sort({ createdAt: -1 }).lean();
    return [...memory.orders].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  },

  async findById(id) {
    if (dbConnected()) {
      if (!mongoose.isValidObjectId(id)) return null;
      return Order.findById(id).lean();
    }
    return memory.orders.find((order) => String(order._id) === String(id)) || null;
  },

  async findByStripeSession(stripeSessionId) {
    if (!stripeSessionId) return null;
    if (dbConnected()) return Order.findOne({ stripeSessionId });
    return memory.orders.find((order) => order.stripeSessionId === stripeSessionId) || null;
  },

  async create(data) {
    if (dbConnected()) {
      const doc = await Order.create(data);
      return doc.toObject();
    }
    const doc = {
      ...data,
      _id: newId(),
      status: data.status || "pending-payment",
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    memory.orders.unshift(doc);
    return doc;
  },

  async updateByStripeSession(stripeSessionId, updates) {
    if (dbConnected()) {
      return Order.findOneAndUpdate({ stripeSessionId }, updates, { new: true });
    }
    const order = memory.orders.find((candidate) => candidate.stripeSessionId === stripeSessionId);
    if (!order) return null;
    Object.assign(order, updates, { updatedAt: nowIso() });
    return order;
  }
};

export const subscribersRepo = {
  async add(email, source = "early-access") {
    const normalized = String(email || "").toLowerCase().trim();
    if (dbConnected()) {
      const existing = await Subscriber.findOne({ email: normalized });
      if (existing) return { created: false };
      await Subscriber.create({ email: normalized, source });
      return { created: true };
    }
    if (memory.subscribers.some((sub) => sub.email === normalized)) return { created: false };
    memory.subscribers.push({ email: normalized, source, createdAt: nowIso() });
    return { created: true };
  },

  async count() {
    if (dbConnected()) return Subscriber.countDocuments({});
    return memory.subscribers.length;
  }
};

/**
 * On startup, seed the bundled MG69 catalog into MongoDB if (and only if) the
 * products collection is empty. The in-memory store is already seeded, so this
 * is a no-op there. Never overwrites an existing catalog.
 */
export async function ensureProductsSeeded() {
  if (!dbConnected()) return;
  const count = await Product.countDocuments({});
  if (count > 0) return;
  await Product.insertMany(fallbackProducts);
  console.log(`✅ Seeded ${fallbackProducts.length} products into MongoDB`);
}
