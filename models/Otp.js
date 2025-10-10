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
      allowNull: true,
      defaultvalue: null
    }
  }, {
    tableName: 'public_otp',
    timestamps: false
  });

  return Otp;
};
/**
 * 
 * CREATE TABLE `public_otp` (
  `otpId` INT AUTO_INCREMENT PRIMARY KEY,
  `otp` VARCHAR(255) NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `otpVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `verifiedAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NULL DEFAULT NULL
 */