const crypto = require('crypto');
const UserTickets = require('../../models/UserTickets');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');

  if (digest !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  try {
    // Update or create user tickets
    const result = await UserTickets.findOneAndUpdate(
      { email },
      { $inc: { tickets: 30 }, lastUpdated: Date.now() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Payment verified and tickets updated successfully',
      tickets: result.tickets
    });
  } catch (error) {
    console.error('Error updating tickets:', error);
    res.status(500).json({ error: 'Error updating tickets' });
  }
} 
