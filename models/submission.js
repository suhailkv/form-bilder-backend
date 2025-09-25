 module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define('Submission', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    form_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    submitted_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    data: { type: DataTypes.JSON, allowNull: false }, // key → value pairs
    ip_address: { type: DataTypes.STRING(50), allowNull: true },
    user_agent: { type: DataTypes.STRING(512), allowNull: true }
  }, {
    tableName: 'submissions'
  });

  return Submission;
};
