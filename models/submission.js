// models/Submission.js
module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define("Submission", {
    formId: { type: DataTypes.INTEGER, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    data: { type: DataTypes.JSON, allowNull: false }
  });
  return Submission;
};
