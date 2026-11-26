import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    googleRefreshToken: { type: String, default: "", select: false },
    resetTokenHash: { type: String, default: "", select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
