import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const users = await User.find({});
      return res.status(200).json(users);
    } 
    
    else if (req.method === 'POST') {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      // Remove password from response for security
      const userResponse = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      };

      return res.status(201).json({ message: 'User created', user: userResponse });
    } 
    
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
