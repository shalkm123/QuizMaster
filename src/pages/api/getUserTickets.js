import connectToDatabase from '../../lib/mongodb'; 
import UserTickets from '../../models/UserTickets'; 

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    await connectToDatabase();

    // safely query the database
    let userTickets = await UserTickets.findOne({ email });

    // Create user with 0 tickets if not found
    if (!userTickets) {
      userTickets = new UserTickets({
        email,
        tickets: 0
      });
      await userTickets.save();
    }

    res.status(200).json({
      tickets: userTickets.tickets || 0,
    });
  } catch (error) {
    console.error('Error fetching/creating tickets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
