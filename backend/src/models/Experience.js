import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const jobExperienceSchema = new Schema(
  {
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    joinDate: {
      type: Date,
      required: true,
    },
    lastDate: {
      type: Date,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// // Update the updatedAt field before saving
jobExperienceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default models.JobExperience ||
  model("JobExperience", jobExperienceSchema);
