// models/Submission.js
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define("Submission", {
    id : { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    formId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    data: { type: DataTypes.JSON, allowNull: false },
    submissionToken: { type: DataTypes.STRING(100), allowNull: true, unique: true },
    userIP: { type: DataTypes.STRING(45), allowNull: true },
    userAgent: { type: DataTypes.STRING(255), allowNull: true },
    referrer: { type: DataTypes.STRING(255), allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'submissions',
    timestamps: false
  });

  // Hook to auto-generate submissionToken before creation
  Submission.beforeCreate(async (submission) => {
    submission.submissionToken = crypto.randomBytes(16).toString('hex'); // 32 char token
  });

  return Submission;
};

/**
 * 
 * CREATE TABLE `submissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `formId` INT UNSIGNED NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `isVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `data` JSON NOT NULL,
  `submissionToken` VARCHAR(100) NOT NULL UNIQUE,
  `userIP` VARCHAR(45) DEFAULT NULL,
  `userAgent` VARCHAR(255) DEFAULT NULL,
  `referrer` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `formId_idx` (`formId`),
  KEY `form_email_idx` (`formId`, `email`),
  CONSTRAINT `submissions_form_fk` FOREIGN KEY (`formId`) REFERENCES `forms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


 */