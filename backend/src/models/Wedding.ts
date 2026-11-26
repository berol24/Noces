import mongoose from "mongoose";

const weddingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    designId: {
      type: String,
      required: true,
      enum: ["classique", "editorial", "jardin", "lin"],
    },
    config: { type: mongoose.Schema.Types.Mixed, required: true },
    driveFolderId: { type: String, default: "" },
    driveFolderUrl: { type: String, default: "" },
    driveFiles: {
      type: [{ id: String, name: String, mimeType: String, guest: { type: Boolean, default: false } }],
      default: [],
    },
  },
  { timestamps: true },
);

weddingSchema.index({ "driveFiles.id": 1 });

export const Wedding = mongoose.model("Wedding", weddingSchema);
