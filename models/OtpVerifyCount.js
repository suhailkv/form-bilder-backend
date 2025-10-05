// models/Otp.js
module.exports = (sequelize, DataTypes) => {
  const OtpVerifyCount = sequelize.define('Otp', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email : {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    fromId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
    },
    count : {
       type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'otp_verify_count',
    timestamps: false
  });

  return OtpVerifyCount;
};
/**
 * 
 * CREATE TABLE `otp_verify_count` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `fromId` INT NOT NULL DEFAULT 0,
   `count` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 */