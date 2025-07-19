import mongoose from "mongoose";

const verificationTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expires: {
      type: Date,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index - MongoDB จะลบ document อัตโนมัติเมื่อหมดอายุ
verificationTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

// Compound index สำหรับ query ที่ใช้บ่อย
verificationTokenSchema.index({ email: 1, expires: 1 });

// Virtual field สำหรับตรวจสอบว่าหมดอายุหรือไม่
verificationTokenSchema.virtual("isExpired").get(function () {
  return this.expires < new Date();
});

// Method สำหรับเพิ่มจำนวนครั้งที่ส่งอีเมล
verificationTokenSchema.methods.incrementAttempts = function () {
  this.attempts += 1;
  return this.save();
};

// Static method สำหรับลบ token ที่หมดอายุ
verificationTokenSchema.statics.cleanExpired = function () {
  return this.deleteMany({ expires: { $lt: new Date() } });
};

// Static method สำหรับหา token ที่ยังใช้ได้
verificationTokenSchema.statics.findValidToken = function (email: string) {
  return this.findOne({
    email,
    expires: { $gt: new Date() },
  });
};

export const VerificationToken =
  mongoose.models.VerificationToken ||
  mongoose.model("VerificationToken", verificationTokenSchema);
