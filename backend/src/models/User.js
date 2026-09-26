import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, maxlength: 100 },
    last_name: { type: String, maxlength: 100 },
    email: { type: String, required: true, maxlength: 250, unique: true },
    role: { type: String, default: "user", maxlength: 50 },
    is_active: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    verification_token: { type: String },
    reset_password_token: { type: String },
    reset_password_expires: { type: Date },
    google_id: { type: Number },
    password: { type: String, select: false },
    address: { type: String },
    pin_code: { type: Number },
    state: { type: String },
    district: { type: String },
    city: { type: String },
    phone: { type: String, unique: true, sparse: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
