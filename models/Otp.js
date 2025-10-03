// models/Otp.js
module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define('Otp', {
    otpId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    otp: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email : {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    otpVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    tableName: 'public_otp',
    timestamps: false
  });

  return Otp;
};
