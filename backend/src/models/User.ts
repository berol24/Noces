import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    googleRefreshToken: { type: String, default: "", select: false },
    resetTokenHash: { type: String, default: "", select: false },
    resetTokenExpires: { type: Date, select: false },
    sessions: {
      type: [
        {
          _id: false,
          hash: { type: String, required: true },
          expires: { type: Date, required: true },
        },
      ],
      select: false,
      default: [],
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
