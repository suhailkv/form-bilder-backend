// models/Form.js
module.exports = (sequelize, DataTypes) => {
  const Form = sequelize.define("Form", {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    schema: DataTypes.JSON,
    thankYouMessage: DataTypes.TEXT,
    bannerImage: DataTypes.STRING,
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
    requireEmailVerification: { type: DataTypes.BOOLEAN, defaultValue: false },
    maxSubmissionsPerUser: { type: DataTypes.INTEGER, defaultValue: 1 } 
  });
  return Form;
};
