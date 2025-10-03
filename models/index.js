const sequelize = require('../db');
const UserModel = require('./user');
const FormModel = require('./form');
const FieldModel = require('./field');
const SubmissionModel = require('./submission');
const { DataTypes } = require('sequelize');

const User = UserModel(sequelize,DataTypes);
const Form = FormModel(sequelize,DataTypes);
const Field = FieldModel(sequelize,DataTypes);
const Submission = SubmissionModel(sequelize,DataTypes);

// Associations
Form.hasMany(Field, { foreignKey: 'formId', as: 'fields' });
Field.belongsTo(Form, { foreignKey: 'formId' });

Form.hasMany(Submission, { foreignKey: 'formId', as: 'submissions' });
Submission.belongsTo(Form, { foreignKey: 'formId' });

User.hasMany(Submission, { foreignKey: 'userId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Form,
  Field,
  Submission
};
