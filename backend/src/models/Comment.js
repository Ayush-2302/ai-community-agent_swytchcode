import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const commentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Comment || model("Comment", commentSchema);
