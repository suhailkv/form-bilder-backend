// models/Otp.js
module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define("Otp", {
    email: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false }
  });
  return Otp;
};
