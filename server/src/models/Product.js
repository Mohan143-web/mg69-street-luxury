import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    type: String,
    tagline: String,
    description: String,
    sizes: [{ type: String }],
    colors: [
      {
        name: String,
        hex: String
      }
    ],
    category: { type: String, enum: ["Men", "Women", "Unisex"], required: true },
    collection: { type: String, required: true },
    stock: { type: Number, default: 0 },
    sizeStock: { type: Map, of: Number },
    images: [
      {
        label: String,
        src: String
      }
    ],
    imageUrl: String,
    specs: { type: Map, of: String },
    tags: [{ type: String }],
    active: { type: Boolean, default: true }
  },
  { suppressReservedKeysWarning: true, timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
