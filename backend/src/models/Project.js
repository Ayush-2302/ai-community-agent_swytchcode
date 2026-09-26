import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    demo: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// Update the updatedAt field before saving
projectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default models.Project || model("Project", projectSchema);
