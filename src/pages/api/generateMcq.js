import { GoogleGenerativeAI } from "@google/generative-ai";
//import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// Gemini config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Form parser utility
const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10 MB
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { fields, files } = await parseForm(req);
    const mcqCount = parseInt(fields.mcqCount);
    const pdfFile = files.file;

    if (!pdfFile || isNaN(mcqCount) || mcqCount <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const pdfBuffer = fs.readFileSync(pdfFile[0].filepath);
    const pdfText = (await pdfParse(pdfBuffer)).text;

    const prompt = `
You are an expert educator.

Based on the following content, generate ${mcqCount} multiple choice questions. Each question must have exactly 4 options, one correct answer, and be returned in this JSON format:

[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "string" // should match one of the options
  }
]

Here is the content:
"""${pdfText.slice(0, 4000)}"""
`;


const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const result = await model.generateContent(prompt);
const response = await result.response;
const content = await response.text();
const jsonStart = content.indexOf("[");
const jsonEnd = content.lastIndexOf("]") + 1;
const jsonText = content.slice(jsonStart, jsonEnd).trim();
let mcqs;
try {
  mcqs = JSON.parse(jsonText);
  // m generated questions stored hai
  //console.log("Parsed MCQs:", mcqs);
} catch (e) {
  console.error("Final JSON parse failed:", e);
  return res.status(500).json({ error: "Failed to parse clean MCQ JSON from response" });
}

// mcqs m generated questions stored hai
//console.log("MCQs:", mcqs);

// Try saving locally
// try {
//   fs.writeFileSync("mcqs.json", JSON.stringify(mcqs, null, 2), "utf-8");
//   console.log("MCQs saved locally");
// } catch (localErr) {
//   console.warn("Local file save failed, uploading to Cloudinary...");

//   const cloudinaryUpload = () =>
//     new Promise((resolve, reject) => {
//           const uploadStream = cloudinary.uploader.upload_stream(
//             {
//               resource_type: "raw",
//               public_id: `mcqs_${Date.now()}`,
//               format: "json",
//             },
//             (error, result) => {
//               if (error) return reject(error);
//               resolve(result);
//             }
//           );

//           Readable.from([JSON.stringify(mcqs, null, 2)]).pipe(uploadStream);
//         });

//       try {
//         const cloudResult = await cloudinaryUpload();
//         console.log("MCQs uploaded to Cloudinary");
//         return res.status(200).json({ mcqs, cloudinaryUrl: cloudResult.secure_url });
//       } catch (cloudErr) {
//         console.error("Cloudinary upload failed:", cloudErr);
//         return res.status(500).json({ error: "Cloudinary upload failed" });
//       }
//     }

    console.log("MCQ generation successful");
    //response  sent 
    return res.status(200).json({ mcqs });
  } catch (err) {
    console.error("Error generating MCQs:", err);
    return res.status(500).json({ error: "Failed to process request" });
  }
};

export default handler;
