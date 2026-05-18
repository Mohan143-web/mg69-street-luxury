import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    category: { type: String, enum: ["Men", "Women", "Unisex"], required: true },
    collection: { type: String, required: true },
    stock: { type: Number, default: 0 },
    imageUrl: String,
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
