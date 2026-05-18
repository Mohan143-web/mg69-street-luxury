import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is not set. API is running without database persistence.");
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "mg69"
  });
}
