import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["customer", "admin", "owner", "access-member", "access_member"], default: "customer" },
    authProviderId: String,
    wishlist: [{ type: String }]
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
