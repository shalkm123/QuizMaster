const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const options = {
      amount: 10000, // amount in smallest currency unit (100 = ₹1)
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      ...order,
      key_id: process.env.RAZORPAY_KEY_ID // Include the key_id in the response
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
} 
