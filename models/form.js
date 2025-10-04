// models/Form.js
module.exports = (sequelize, DataTypes) => {
  const Form = sequelize.define("Form", {
    id : { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    schema: DataTypes.JSON,
    thankYouMessage: DataTypes.TEXT,
    bannerImage: DataTypes.STRING,
    publishedAt: { type: DataTypes.DATE, allowNull: true,defaultValue:null},
    requireEmailVerification: { type: DataTypes.BOOLEAN, defaultValue: false },
    maxSubmissionsPerUser: { type: DataTypes.INTEGER, defaultValue: 1 },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
    deletedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  },{
    tableName: 'forms',
    timestamps: false
  });
  return Form;
};
/**
 * 
 * 
 * CREATE TABLE `forms` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `schema` JSON DEFAULT NULL,
  `thankYouMessage` TEXT DEFAULT NULL,
  `bannerImage` VARCHAR(255) DEFAULT NULL,
  `publishedAt` DATETIME NULL DEFAULT NULL,
  `requireEmailVerification` BOOLEAN NOT NULL DEFAULT FALSE,
  `maxSubmissionsPerUser` INT NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdBy` INT UNSIGNED NOT NULL,
  `deletedAt` DATETIME DEFAULT NULL,
  `deletedBy` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


 */