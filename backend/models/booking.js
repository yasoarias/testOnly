module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    // ... existing fields ...
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  })

  Booking.associate = function(models) {
    Booking.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    })
  }

  return Booking
} 