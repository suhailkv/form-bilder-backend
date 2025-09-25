module.exports = (sequelize, DataTypes) => {
  const Form = sequelize.define('Form', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    settings: { type: DataTypes.JSON, allowNull: true, defaultValue: {} }, // e.g., theme, options
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  }, {
    tableName: 'forms'
  });

  return Form;
};
