import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: String, index: true },
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
        src: String,
        srcSet: String,
        sizes: String,
        width: Number,
        height: Number,
        cropClass: String,
        color: String
      }
    ],
    colorVariants: [
      {
        name: String,
        hex: String,
        images: {
          front: {
            label: String,
            src: String,
            srcSet: String,
            sizes: String,
            width: Number,
            height: Number,
            cropClass: String,
            color: String
          },
          back: {
            label: String,
            src: String,
            srcSet: String,
            sizes: String,
            width: Number,
            height: Number,
            cropClass: String,
            color: String
          },
          side: {
            label: String,
            src: String,
            srcSet: String,
            sizes: String,
            width: Number,
            height: Number,
            cropClass: String,
            color: String
          }
        },
        gallery: [
          {
            label: String,
            src: String,
            srcSet: String,
            sizes: String,
            width: Number,
            height: Number,
            cropClass: String,
            color: String
          }
        ]
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
