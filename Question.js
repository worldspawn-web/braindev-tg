const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Question = sequelize.define('Question', {
  questionText: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option3: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option4: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correctOption: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  explanation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Question;
