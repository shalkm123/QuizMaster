import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // tokens: {
  //   type: Number,
  //   default: 0
  // }
});

// Prevent model overwrite issue in Next.js hot reload
export default mongoose.models.User || mongoose.model('User', UserSchema);
