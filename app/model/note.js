import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: String,
  description: String,
});

export default noteSchema;
