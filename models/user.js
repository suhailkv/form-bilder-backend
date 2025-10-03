const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    name: { type: DataTypes.STRING(255) },
    passwordHash: { type: DataTypes.STRING(255) },
    role: { type: DataTypes.ENUM('admin','submitter'), defaultValue: 'submitter' }
  }, {
    tableName: 'users',
    timestamps: true
  });

  return User;
};
