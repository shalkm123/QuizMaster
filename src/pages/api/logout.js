export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict');
  res.status(200).json({ message: 'Logged out' });
}
