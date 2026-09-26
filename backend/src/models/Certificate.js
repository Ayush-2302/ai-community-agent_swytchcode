import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const certificateSchema = new mongoose.Schema(
  {
    issuer: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Certificate || model("Certificate", certificateSchema);
