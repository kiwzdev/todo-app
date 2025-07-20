import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    image: { type: String, required: true, default: "null" },
    emailVerified: { type: Date, required: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
