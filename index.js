const TelegramApi = require('node-telegram-bot-api');
const sequelize = require('./sequelize');
const UserStats = require('./userstats');
const Question = require('./Question');
const { gameOptions } = require('./options');
const cron = require('node-cron');

const token = '6328418661:AAEw1q23_4xv3sclbcC0d91aFPk4kIXi8Zo';
const bot = new TelegramApi(token, { polling: true });

const getRandomQuestion = async () => {
  try {
    const randomQuestion = await Question.findOne({
      order: sequelize.random(),
    });
    return randomQuestion;
  } catch (e) {
    console.error('Error while trying to get a random question:', e);
    throw error;
  }
};

const start = async () => {
  // db connection
  try {
    await sequelize.authenticate();
    console.log('Connected.');

    // creates UserStats table in SQLite
    await UserStats.sync({ force: true });
    console.log('Table "UserStats" created.');
  } catch (e) {
    console.error('Unable to connect to the database:\n', e);
  }

  cron.schedule('0 */12 * * *', async () => {
    await sendQuestion(chatId);
  });

  // custom cmds
  bot.setMyCommands([
    { command: '/rules', description: 'Правила игры' },
    { command: '/start', description: 'Начать игру!' },
    { command: '/stats', description: 'Статистика игр' },
    { command: '/top', description: 'Топ игроков' },
  ]);

  // message reaction
  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const username = msg.from.first_name;

    // checker if user is already in database
    const isThisFirstTime = async (chatId) => {
      const userStats = await UserStats.findOne({
        where: { userId: chatId },
      });
      if (userStats) {
        return true;
      } else {
        return false;
      }
    };

    // if user doesn't exist, create a new row in database
    if (isThisFirstTime(chatId)) {
      try {
        const addedUserStats = await UserStats.create({
          userId: chatId,
          username: username,
          totalGames: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
        });
        return addedUserStats;
      } catch (e) {
        console.error('Error while creating new user:', e);
      }
    }

    const sendQuestion = async (chatId) => {
      const question = await getRandomQuestion();
      await bot.sendMessage(chatId, question.questionText);
      await bot.sendMessage(chatId, 'Ваш ответ:', gameOptions);
    };

    const handleAnswer = async (chatId, userId, answer) => {
      const question = await getRandomQuestion();
      // if correct
      if (question.correctOption === answer) {
        try {
          const userStats = await UserStats.findOne({
            where: { userId: chatId },
          });

          if (userStats) {
            const newCorrectAnswers = userStats.correctAnswers + 1;
            const newTotalGames = userStats.totalGames + 1;
            await userStats.update({
              correctAnswers: newCorrectAnswers,
              totalGames: newTotalGames,
            });
            await bot.sendMessage(chatId, 'Правильно!');
            await bot.sendMessage(
              chatId,
              `Объяснение: ${question.explanation}`
            );
          }
        } catch (e) {
          console.error('Error while handling correct answer:', e);
          throw e;
        }
      } else {
        // if incorrect
        try {
          const userStats = await UserStats.findOne({
            where: { userId: chatId },
          });
          if (userStat) {
            const newWrongAnswers = userStats.wrongAnswers + 1;
            const newTotalGames = userStats.totalGames + 1;
            await userStats.update({
              wrongAnswers: newWrongAnswers,
              totalGames: newTotalGames,
            });
            await bot.sendMessage(chatId, 'Неправильно!');
            await bot.sendMessage(
              chatId,
              `Объяснение: ${question.explanation}`
            );
          }
        } catch (e) {
          console.error('Error while handling wrong answer:', e);
          throw e;
        }
      }
    };

    // get total games played count
    const getGamesCount = async (chatId) => {
      try {
        const userStats = await UserStats.findOne({
          where: { userId: chatId },
        });
        if (userStats) {
          return userStats.totalGames;
        } else {
          console.log(`User with user ID ${chatId} not found.`);
          return null;
        }
      } catch (e) {
        console.error('Error while fetching games played by user:', e);
        throw e;
      }
    };

    // game logic; reacts on text cmds
    try {
      // describes game rules and the game goal
      if (text === '/rules') {
        await bot.sendSticker(
          chatId,
          'https://cdn.tlgrm.app/stickers/8eb/10f/8eb10f4b-8f4f-4958-aa48-80e7af90470a/192/6.webp'
        );
        return bot.sendMessage(
          chatId,
          `Приветствую тебя, ${username}!\nДобро пожаловать в Brain-Games!\nЦель игры: ежедневный 'разгон' серого вещества, путём напряжения мозга :)\nНапрягать мозг будем с помощью вопросов на самые различные темы и последующих их объяснений.\nПо началу может быть тяжело, но со временем ты заметишь, что знаешь больше!\nНу что, начнём?`
        );
      }

      // starts the game
      if (text === '/start') {
        startGame(chatId);
      }

      // shows stats
      if (text === '/stats') {
        return bot.sendMessage(
          chatId,
          `Пользователь: ${username}\nКол-во сыгранных игр: ${await getGamesCount(
            chatId
          )}`
        );
      }

      // TODO: shows top-15 of db players
      if (text === '/top') {
        return bot.sendMessage(chatId, `Функция в разработке...`);
      }
    } catch (e) {
      return bot.sendMessage(chatId, 'Извини, я не распознал твоё сообщение.');
    }
  });
};

start();
