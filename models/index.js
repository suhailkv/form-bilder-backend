const Sequelize = require('sequelize');
const sequelize = require('../config/database');

// const User = require('./user')(sequelize, Sequelize.DataTypes);
const Form = require('./form')(sequelize, Sequelize.DataTypes);
const Field = require('./field')(sequelize, Sequelize.DataTypes);
const Submission = require('./submission')(sequelize, Sequelize.DataTypes);

// Associations
// User.hasMany(Form, { foreignKey: 'created_by', as: 'forms' });
// Form.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Form.hasMany(Field, { foreignKey: 'form_id', as: 'fields', onDelete: 'CASCADE' });
Field.belongsTo(Form, { foreignKey: 'form_id', as: 'form' });

Form.hasMany(Submission, { foreignKey: 'form_id', as: 'submissions', onDelete: 'CASCADE' });
Submission.belongsTo(Form, { foreignKey: 'form_id', as: 'form' });

// User.hasMany(Submission, { foreignKey: 'submitted_by', as: 'submissions' });
// Submission.belongsTo(User, { foreignKey: 'submitted_by', as: 'submitter' });

module.exports = {
  sequelize,
  Sequelize,
  Form,
  Field,
  Submission
};
