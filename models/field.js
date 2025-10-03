const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Field = sequelize.define('Field', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    formId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    fieldId: { type: DataTypes.STRING(255), allowNull: false }, // id used in JSON schema (e.g., field_123)
    definition: { type: DataTypes.JSON, allowNull: false }
  }, {
    tableName: 'fields',
    timestamps: true
  });

  return Field;
};
