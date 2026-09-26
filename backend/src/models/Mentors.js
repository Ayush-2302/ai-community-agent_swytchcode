import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const mentorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    profileLink: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

mentorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default models.Mentor || model("Mentor", mentorSchema);
