const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const UserStats = sequelize.define('UserStats', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalGames: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  wrongAnswers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = UserStats;
