module.exports = {
  gameOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: '1', callback_data: '1' }],
        [{ text: '2', callback_data: '2' }],
        [{ text: '3', callback_data: '3' }],
        [{ text: '4', callback_data: '4' }],
      ],
    }),
  },
};
