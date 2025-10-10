import connectToDatabase from "@/lib/mongodb";
import { McqModel } from "@/models/McqModel";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email query parameter is required" });
  }

  try {
    await connectToDatabase();
    const mcqsDoc = await McqModel.find({ email });

    if (!mcqsDoc || mcqsDoc.length === 0) {
      return res.status(404).json({ error: "MCQs not found for this email" });
    }

    return res.status(200).json({ mcqs: mcqsDoc }); // key is 'mcqs'
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
