import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const skillsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

skillsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure to check if the model exists
const Skills = models.Skills || model("Skills", skillsSchema);
export default Skills;
