import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    id: String,
    name: String,
    size: String,
    color: String,
    quantity: { type: Number, default: 1 },
    price: Number
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    address: mongoose.Schema.Types.Mixed,
    items: [orderItemSchema],
    total: { type: Number, required: true },
    stripeSessionId: String,
    status: {
      type: String,
      enum: ["draft", "pending-payment", "paid", "fulfilled", "cancelled"],
      default: "draft"
    }
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
