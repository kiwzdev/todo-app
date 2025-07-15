import { Schema, model, models } from "mongoose";

const verificationTokenSchema = new Schema(
  {
    token: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    expires: { type: Date, required: true },
  },
  { timestamps: true }
);

export const VerificationToken =
  models.VerificationToken ||
  model("VerificationToken", verificationTokenSchema);
