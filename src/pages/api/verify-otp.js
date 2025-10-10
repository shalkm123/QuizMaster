// pages/api/sendOtp.js
import sgMail from '@sendgrid/mail';
import { randomInt } from 'crypto';
import connectToDatabase from '../../lib/mongodb'; // ensure this sets up mongoose
import PendingUser from '../../models/PendingUser';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    await connectToDatabase();

    const code = String(randomInt(100000, 999999));
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await PendingUser.findOneAndUpdate(
      { email },
      { email, code, expires },
      { upsert: true, new: true }
    );

    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${code}. It will expire in 10 minutes.`,
      html: `<p>Your OTP code is <strong>${code}</strong>. It will expire in 10 minutes.</p>`,
    });

    return res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('SendGrid error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
}
