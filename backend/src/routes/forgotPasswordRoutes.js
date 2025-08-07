import express from 'express';
import crypto from 'crypto';
import { User } from "../models/User.models.js";
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const router = express.Router();
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kg2848381@gmail.com',
        pass: 'sepa ihob rnuz ofzo'
      }
    });
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `
        <h2>You requested a password reset.</h2>
        <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Click here to reset your password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If the button doesn't work, copy and paste this link: ${resetUrl}</p>
      `
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      console.log('ERROR: No token provided in URL params');
      return res.status(400).json({ 
        message: 'No reset token provided',
        redirect: '/forgot-password' 
      });
    }
    const user = await User.findOne({
      resetPasswordToken: token
    });
    
    const userWithValidToken = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('10. User found (with expiry check):', !!userWithValidToken);

    if (!userWithValidToken) {
      const errorMsg = user 
        ? 'Reset token has expired' 
        : 'Invalid reset token';
      
      console.log('ERROR:', errorMsg);
      return res.status(400).json({ 
        message: errorMsg,
        redirect: '/forgot-password',
        debug: {
          tokenFound: !!user,
          isExpired: user ? user.resetPasswordExpires <= Date.now() : null
        }
      });
    }

    res.json({ 
      message: 'Token is valid', 
      token: token,
      email: userWithValidToken.email 
    });
    
  } catch (error) {
    console.error('GET token verification error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    console.log('POST verify token:', token);

    if (!token) {
      console.log('No token provided in request body');
      return res.status(400).json({ message: 'Token is required' });
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('User found:', !!user);
    if (user) {
      console.log('Token expires at:', new Date(user.resetPasswordExpires));
      console.log('Current time:', new Date());
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.json({ message: 'Token is valid', email: user.email });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    console.log('Reset password attempt for token:', token);

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired token during reset');
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('Password reset successful for user:', user.email);
    res.json({ message: 'Password reset successful' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;