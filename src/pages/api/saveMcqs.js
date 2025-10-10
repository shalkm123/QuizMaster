import mongoose from "mongoose";
import { McqModel } from "@/models/McqModel";
//import { McqModel } from "../../lib/models/McqModel";
import connectToDatabase from '@/lib/mongodb';

export default async function handler(req, res) {
  await connectToDatabase();
  console.log("MongoDB connected");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, mcqs } = req.body;

  if (!email || !mcqs || !Array.isArray(mcqs)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    await McqModel.create({ email, mcqs });
    return res.status(200).json({ message: "MCQs saved successfully" });
  } catch (err) {
    console.error("MongoDB save error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
