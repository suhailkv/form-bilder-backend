const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Field = sequelize.define('Field', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    formId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    fieldId: { type: DataTypes.STRING(255), allowNull: false }, // id used in JSON schema (e.g., field_123)
    definition: { type: DataTypes.JSON, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null},
    createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    updatedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true , defaultValue: null},
    deletedAt: { type: DataTypes.DATE, allowNull: true },
    deletedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {
    tableName: 'form_fields',
    timestamps: false
  });

  return Field;
};
/**
 * 
 * CREATE TABLE `form_fields` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `formId` INT UNSIGNED NOT NULL,
  `fieldId` VARCHAR(255) NOT NULL,
  `definition` JSON NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT NULL,
  `createdBy` INT UNSIGNED NOT NULL,
  `updatedBy` INT UNSIGNED NULL DEFAULT NULL,
  `deletedAt` DATETIME DEFAULT NULL,
  `deletedBy` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `formId_idx` (`formId`),
  CONSTRAINT `form_fields_form_fk` FOREIGN KEY (`formId`) REFERENCES `forms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

 */