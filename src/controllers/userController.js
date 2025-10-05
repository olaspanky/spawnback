// // controllers/userController.js
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// exports.signup = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (user) return res.status(400).json({ message: 'User already exists' });

//     user = new User({ username, email, password });

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     await user.save();

//     const payload = { user: { id: user.id } };
//     jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
//       if (err) throw err;
//       res.json({ token });
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };

// exports.login = async (req, res) => {
  // const { email, password } = req.body;

  // try {
  //   const user = await User.findOne({ email });
  //   if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  //   const isMatch = await bcrypt.compare(password, user.password);
  //   if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  //   const payload = { user: { id: user._id, username: user.username } }; // Use _id for MongoDB
  //   jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
  //     if (err) throw err;
  //     res.json({ token, user: { id: user._id, name: user.username } }); // Include user ID in response
  //   });
  // } catch (err) {
  //   console.error(err.message);
  //   res.status(500).send('Server error');
  // }
// };

// controllers/userController.js






const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // For sending OTP emails
const { OAuth2Client } = require('google-auth-library'); // For Google OAuth

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email transporter setup (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check for existing email
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists with this email' });

    // Create new user (no username uniqueness check)
    user = new User({ username, email, password, isVerified: false, isAdmin: false });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Log email sending attempt
    console.log(`Sending OTP ${otp} to ${email}`);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });
    console.log('OTP email sent successfully');

    const payload = { user: { id: user.id, isAdmin: user.isAdmin || false, isVerified: user.isVerified || false } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: { id: user._id, name: user.username, email: user.email, isAdmin: user.isAdmin || false, isVerified: false }
      });
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.googleSignup = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (user) {
      if (!user.googleId) user.googleId = googleId;
    } else {
      user = new User({
        username: name,
        email,
        googleId,
        isVerified: true, // Google verified email
      });
    }

    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user._id, name: user.username } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Email not verified' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin || false, // Include isAdmin
        isVerified: user.isVerified || false // Include isVerified
      }
    };

    // Sign JWT and send response
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('JWT signing error:', err.message);
        throw err;
      }
      const response = {
        token,
        user: {
          id: user._id,
          name: user.username,
          email: user.email,
          isAdmin: user.isAdmin || false, // Include isAdmin
          isVerified: user.isVerified || false // Include isVerified
        }
      };
      console.log('Login response:', response); // Log the response
      res.json(response);
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};