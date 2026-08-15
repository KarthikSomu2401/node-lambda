import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export default noteSchema;
