const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('DB Connection Error:', err));

// SCHEMAS (Updated with structured Category field)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const LogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'Excavation' }, // Added production field
  description: { type: String, required: true },
  materialCost: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});
const Log = mongoose.model('Log', LogSchema);

// AUTHENTICATION MIDDLEWARE
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

// AUTH ROUTES
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, username: user.username });
  } catch (err) {
    res.status(400).json({ error: 'Username already taken.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid login credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROTECTED ROUTES
app.post('/api/logs', auth, async (req, res) => {
  try {
    const newLog = new Log({ ...req.body, userId: req.userId });
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/logs', auth, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.userId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/logs/:id', auth, async (req, res) => {
  try {
    await Log.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Record removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
