import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema({
  email: { type: String, required: true },
  mcqs: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const McqModel = mongoose.models.Mcq || mongoose.model("Mcq", mcqSchema);
