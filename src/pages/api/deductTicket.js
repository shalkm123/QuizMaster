
import connectToDatabase from '../../lib/mongodb';
import UserTickets from '../../models/UserTickets';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
     const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email query parameter not found' });
    }
    await connectToDatabase();

    // Check if user exists
    const userTickets = await UserTickets.findOne({ email });
    if (!userTickets) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await UserTickets.findOneAndUpdate(
      {
        email,
        tickets: { $gt: 0 }
      },
      {
        $inc: { tickets: -1 }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(400).json({ error: 'No tickets available' });
    }

    console.log(`Ticket deducted for ${email}. Remaining: ${updatedUser.tickets}`);

    return res.status(200).json({
      success: true,
      remainingTickets: updatedUser.tickets,
      message: 'Ticket deducted successfully'
    });

  } catch (error) {
    console.error('Error deducting ticket:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
