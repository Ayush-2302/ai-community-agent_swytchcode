import { Schema, model, models } from "mongoose";

const skillsCategorySchema = new Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

skillsCategorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default models.SkillsCategory ||
  model("SkillsCategory", skillsCategorySchema);
