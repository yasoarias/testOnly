const db = require('../config/database');
const jwt = require('jsonwebtoken');

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, contactNo } = req.body;
    const userId = req.user.id; // Get user ID from auth middleware

    // Validate input
    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Full name and email are required'
      });
    }

    // Check if email is already taken by another user
    const emailCheckQuery = 'SELECT id FROM users WHERE email = ? AND id != ?';
    const [existingUser] = await db.query(emailCheckQuery, [email, userId]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }

    // Update user profile
    const updateQuery = `
      UPDATE users 
      SET fullName = ?, 
          email = ?, 
          contactNo = ?,
          updated_at = NOW()
      WHERE id = ?
    `;

    await db.query(updateQuery, [fullName, email, contactNo, userId]);

    // Fetch updated user data
    const [updatedUser] = await db.query(
      'SELECT id, fullName, email, contactNo, role FROM users WHERE id = ?',
      [userId]
    );

    if (updatedUser.length === 0) {
      throw new Error('User not found after update');
    }

    // Generate new token with updated info
    const token = jwt.sign(
      { id: userId, email, role: updatedUser[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0],
      token
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
}; 