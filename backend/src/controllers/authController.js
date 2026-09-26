import bcrypt from "bcrypt";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ExpressError from "../utils/ExpressError.js";
import {
  sendPasswordEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "../utils/nodemailer.js";
import config from "../config/env.js";

const client = config.auth.googleClientId ? new OAuth2Client(config.auth.googleClientId) : null;

const generateJwtToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`,
    },
    config.auth.jwtSecret,
    { expiresIn: "5h" }
  );
};

const handleGoogleAuth = async (token) => {
  if (!client) {
    throw new Error("Google OAuth2 is not configured. Missing GOOGLE_CLIENT_ID in environment.");
  }
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.auth.googleClientId,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name = "" } = payload;

  const [first_name = "", ...rest] = name.split(" ");
  const last_name = rest.join(" ");

  let user = await User.findOne({ $or: [{ google_id: googleId }, { email }] });

  if (!user) {
    // Generate password directly for new Google users
    const emailPrefix = email.split("@")[0];
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const plainPassword = `${emailPrefix}-${randomDigits}`;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = new User({
      first_name,
      last_name,
      email,
      google_id: googleId,
      password: hashedPassword,
      is_verified: true,
      is_active: true,
    });

    await newUser.save();
    await sendPasswordEmail(first_name, email, plainPassword);

    // Generate JWT token and return login success
    const jwtToken = generateJwtToken(newUser);

    return {
      message: "Registration successful! Your password has been sent to your email.",
      token: jwtToken,
      user: {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        is_active: newUser.is_active,
      },
    };
  }

  // Case 2: User exists but is inactive
  if (!user.is_active) {
    throw new ExpressError(403, "Your account is deactivated.", false);
  }

  // Case 3: User exists and is active — log in
  const jwtToken = generateJwtToken(user);

  return {
    message: "Login successful",
    token: jwtToken,
    user: {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    },
  };
};

// ============ REGISTER ============
export const registerUser = asyncWrapper(async (req, res) => {
  const { googleToken } = req.body;

  // Only allow Google OAuth registration
  if (!googleToken) {
    throw new ExpressError(400, "Registration is only allowed through Google OAuth.", false);
  }

  const result = await handleGoogleAuth(googleToken);
  return res.status(200).json(result);
});

// ============ LOGIN ============
export const loginUser = asyncWrapper(async (req, res) => {
  const { email, password, googleToken } = req.body;

  if (googleToken) {
    const result = await handleGoogleAuth(googleToken);
    return res.status(200).json(result);
  }

  if (!email || !password) {
    throw new ExpressError(400, "Email and password are required.", false);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ExpressError(400, "Invalid credentials.", false);
  }

  if (!user.is_active) {
    throw new ExpressError(403, "Your account is deactivated.", false);
  }

  const token = generateJwtToken(user);

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    },
  });
});

// ============ FORGOT PASSWORD ============
export const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ExpressError(404, "User not found.", false);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.reset_password_token = hashedToken;
  user.reset_password_expires = Date.now() + 3600000;
  await user.save();

  const resetUrl = `${config.server.frontendUrl}/reset-password/${resetToken}`;
  await sendResetPasswordEmail(email, resetUrl);

  res.status(200).json({ message: "Reset email sent successfully." });
});

// ============ RESET PASSWORD ============
export const resetPassword = asyncWrapper(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    reset_password_token: hashedToken,
    reset_password_expires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ExpressError(400, "Token is invalid or expired.", false);
  }

  user.password = await bcrypt.hash(password, 12);
  user.reset_password_token = undefined;
  user.reset_password_expires = undefined;
  await user.save();

  res.status(200).json({ message: "Password has been reset successfully." });
});

// ============ VERIFY EMAIL ============
export const verifyUserEmail = asyncWrapper(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Missing token." });
  }

  const user = await User.findOne({ verification_token: token });
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token." });
  }

  const emailPrefix = user.email.split("@")[0];
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const plainPassword = `${emailPrefix}-${randomDigits}`;

  user.password = await bcrypt.hash(plainPassword, 10);
  user.is_verified = true;
  user.verification_token = undefined;
  await user.save();

  await sendPasswordEmail(user.first_name, user.email, plainPassword);

  return res.status(200).json({
    message:
      "Email verified successfully. A temporary password has been sent to your email.",
    success: true,
  });
});

export const updateUserProfile = asyncWrapper(async (req, res) => {
  const userId = req.params.user_id;
  // Define fields that are allowed to be updated
  const allowedFields = [
    "first_name",
    "last_name",
    "address",
    "pin_code",
    "phone",
    "state",
    "city",
    "district",
  ];

  const updates = {};

  // Add allowed fields if present in the request body
  for (const field of allowedFields) {
    const value = req.body[field];
    if (value !== undefined && value !== null && value !== "") {
      updates[field] = value;
    }
  }
  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update." });
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) {
    return res.status(404).json({ message: "User not found." });
  }

  // Build response with safe user info
  return res.status(200).json({
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      pin_code: updatedUser.pin_code,
      district: updatedUser.district,
      city: updatedUser.city,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
    },
  });
});

export const updateAvatarController = asyncWrapper(async (req, res) => {
  const userId = req.params.user_id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Please provide a valid avatar." });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (user.avatar) {
    try {
      deleteFile(user.avatar);
    } catch (err) {
      console.error("Error deleting old avatar:", err);
    }
  }

  user.avatar = file.filename;
  await user.save();

  return res.status(200).json({
    message: "Avatar updated successfully",
    user: {
      id: user._id,
      avatar: user.avatar,
    },
  });
});

export const getUserById = asyncWrapper(async (req, res) => {
  const { user_id } = req.params;
  const user = await User.findById(user_id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.status(200).json({ user });
});

// ============ GET ALL USERS (Admin) ============
export const getAllUsers = asyncWrapper(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  if (page && limit) {
    const totalCount = await User.countDocuments();
    const users = await User.find({})
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      message: "Users fetched successfully",
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    });
  } else {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  }
});

// ============ UPDATE USER (Admin) ============
export const updateUser = asyncWrapper(async (req, res) => {
  const { user_id } = req.params;
  const { role, is_active } = req.body;

  const user = await User.findById(user_id);

  if (!user) {
    throw new ExpressError(404, "User not found", false);
  }

  if (role) {
    user.role = role;
  }

  if (is_active !== undefined) {
    user.is_active = is_active;
  }

  await user.save();

  res.status(200).json({
    message: "User updated successfully",
    user,
  });
});
