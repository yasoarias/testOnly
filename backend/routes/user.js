const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Assuming you have auth middleware

router.put('/profile/update', auth, async (req, res) => {
  try {
    const { fullName, email, contactNo } = req.body;
    
    // Validate input
    if (!fullName || !email || !contactNo) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    user.fullName = fullName;
    user.email = email;
    user.contactNo = contactNo;

    // Save updated user
    const updatedUser = await user.save();

    // Return response
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        contactNo: updatedUser.contactNo,
        profilePicture: updatedUser.profilePicture
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
}); 