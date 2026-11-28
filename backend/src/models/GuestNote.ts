import mongoose from "mongoose";

const guestNoteSchema = new mongoose.Schema(
  {
    weddingId: { type: mongoose.Schema.Types.ObjectId, ref: "Wedding", required: true, index: true },
    kind: { type: String, enum: ["book", "meal"], required: true },
    name: { type: String, required: true },
    message: { type: String, default: "" },
    menu: { type: String, default: "" },
  },
  { timestamps: true },
);

export const GuestNote = mongoose.model("GuestNote", guestNoteSchema);
