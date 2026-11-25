
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

const { JWT_SECRET, MONGO_URI, ADMIN_USERNAME } = process.env;

if (!JWT_SECRET || JWT_SECRET.length < 32 || !MONGO_URI || !ADMIN_USERNAME) {
  throw new Error(
    'Configure MONGO_URI, JWT_SECRET (at least 32 characters), and ADMIN_USERNAME in Render.'
  );
}

// DATABASE SCHEMAS

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', UserSchema);

const LogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Excavation'
  },
  description: {
    type: String,
    required: true
  },
  materialCost: {
    type: Number,
    default: 0
  },
  submittedBy: {
    type: String,
    default: 'Guest'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Log = mongoose.model('Log', LogSchema);

// ROLE MANAGEMENT

const role = user =>
  user.username === ADMIN_USERNAME
    ? 'admin'
    : 'contributor';

const session = user => ({
  token: jwt.sign(
    { userId: user._id },
    JWT_SECRET,
    {
      expiresIn: '24h',
      algorithm: 'HS256'
    }
  ),
  username: user.username,
  role: role(user)
});

// AUTHENTICATION MIDDLEWARE

async function auth(req, res, next) {
  try {
    const match = /^Bearer (\S+)$/.exec(
      req.get('Authorization') || ''
    );

    if (!match) {
      return res.status(401).json({
        error: 'Please authenticate.'
      });
    }

    const decoded = jwt.verify(
      match[1],
      JWT_SECRET,
      { algorithms: ['HS256'] }
    );

    const user = await User.findById(
      decoded.userId
    ).select('username');

    if (!user) {
      return res.status(401).json({
        error: 'Please authenticate.'
      });
    }

    req.user = user;
    next();

  } catch {
    res.status(401).json({
      error: 'Please authenticate.'
    });
  }
}

// ADMINISTRATOR MIDDLEWARE

function admin(req, res, next) {
  if (role(req.user) !== 'admin') {
    return res.status(403).json({
      error: 'Administrator access required.'
    });
  }

  next();
}

// REGISTRATION

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== 'string' ||
      username.trim() !== username ||
      username.length < 4 ||
      username.length > 15 ||
      typeof password !== 'string' ||
      password.length < 6 ||
      password.length > 20
    ) {
      return res.status(400).json({
        error: 'Username must be 4–15 characters and password 6–20 characters.'
      });
    }

    if (
      username.toLowerCase() ===
      ADMIN_USERNAME.toLowerCase()
    ) {
      return res.status(403).json({
        error: 'Username unavailable.'
      });
    }

    const user = await User.create({
      username,
      password: await bcrypt.hash(password, 12)
    });

    res.status(201).json(session(user));

  } catch (err) {
    res.status(err.code === 11000 ? 409 : 500).json({
      error: err.code === 11000
        ? 'Username already taken.'
        : 'Registration failed.'
    });
  }
});

// LOGIN

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      username.length > 200 ||
      password.length > 200
    ) {
      return res.status(400).json({
        error: 'Invalid login credentials'
      });
    }

    const user = await User.findOne({ username });

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(400).json({
        error: 'Invalid login credentials'
      });
    }

    res.json(session(user));

  } catch {
    res.status(500).json({
      error: 'Login failed.'
    });
  }
});

// VERIFY CURRENT USER

app.get('/api/auth/me', auth, (req, res) => {
  res.json({
    username: req.user.username,
    role: role(req.user)
  });
});

// VALIDATE RECORD DATA

function readLog(body) {
  const {
    title,
    description,
    category = 'Excavation',
    materialCost = 0
  } = body || {};

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    title.length > 200 ||
    typeof description !== 'string' ||
    !description.trim() ||
    description.length > 5000 ||
    typeof category !== 'string' ||
    !category.trim() ||
    category.length > 100 ||
    (
      typeof materialCost !== 'number' &&
      typeof materialCost !== 'string'
    ) ||
    !Number.isFinite(Number(materialCost)) ||
    Number(materialCost) < 0
  ) {
    return null;
  }

  return {
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    materialCost: Number(materialCost)
  };
}

// READ RECORDS

app.get('/api/logs', auth, async (req, res) => {
  try {
    const logs = await Log.find({}).sort({
      date: -1
    });

    res.json(logs);

  } catch {
    res.status(500).json({
      error: 'Unable to load records.'
    });
  }
});

// CREATE RECORD

app.post('/api/logs', auth, async (req, res) => {
  const data = readLog(req.body);

  if (!data) {
    return res.status(400).json({
      error: 'Enter valid activity details and a non-negative cost.'
    });
  }

  try {
    const savedLog = await Log.create({
      ...data,
      submittedBy: req.user.username
    });

    res.status(201).json(savedLog);

  } catch {
    res.status(500).json({
      error: 'Unable to save record.'
    });
  }
});

// UPDATE RECORD - ADMIN ONLY

app.put('/api/logs/:id', auth, admin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: 'Invalid record ID.'
    });
  }

  const data = readLog(req.body);

  if (!data) {
    return res.status(400).json({
      error: 'Enter valid activity details and a non-negative cost.'
    });
  }

  try {
    const updatedLog = await Log.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedLog) {
      return res.status(404).json({
        error: 'Record not found.'
      });
    }

    res.json(updatedLog);

  } catch {
    res.status(500).json({
      error: 'Unable to update record.'
    });
  }
});

// DELETE RECORD - ADMIN ONLY

app.delete('/api/logs/:id', auth, admin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: 'Invalid record ID.'
    });
  }

  try {
    const deletedLog = await Log.findByIdAndDelete(
      req.params.id
    );

    if (!deletedLog) {
      return res.status(404).json({
        error: 'Record not found.'
      });
    }

    res.json({
      message: 'Record removed successfully'
    });

  } catch {
    res.status(500).json({
      error: 'Unable to delete record.'
    });
  }
});

// DATABASE CONNECTION AND SERVER

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(
      'Database connection failed:',
      err.message
    );

    process.exit(1);
  });
