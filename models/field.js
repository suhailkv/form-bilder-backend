module.exports = (sequelize, DataTypes) => {
  const Field = sequelize.define('Field', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    form_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    label: { type: DataTypes.STRING(255), allowNull: false },
    key: { type: DataTypes.STRING(255), allowNull: false }, // unique within form, used as JSON key
    type: { type: DataTypes.ENUM('text', 'textarea', 'number', 'checkbox', 'radio', 'select', 'date', 'email'), allowNull: false },
    required: { type: DataTypes.BOOLEAN, defaultValue: false },
    options: { type: DataTypes.JSON, allowNull: true }, // for select/radio/checkbox: [{value,label}]
    order: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    tableName: 'fields',
    indexes: [
      { unique: false, fields: ['form_id', 'key'] }
    ]
  });

  return Field;
};
