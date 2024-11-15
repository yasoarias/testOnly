const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const Booking = require('../models/Booking')

// Add this new route to your backend
router.get('/bookings/user/:userId', authenticateToken, async (req, res) => {
  try {
    // Verify that the requesting user matches the userId parameter
    if (req.user.id !== parseInt(req.params.userId)) {
      return res.status(403).json({ message: 'Unauthorized access to bookings' })
    }

    const userBookings = await Booking.findAll({
      where: {
        userId: req.params.userId
      },
      order: [['createdAt', 'DESC']]
    })

    res.json(userBookings)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message })
  }
})

module.exports = router 