'use strict';
const dispatch = require('./dispatch');

module.exports.intents = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('event', event);
  try {
    console.log(`event.bot.name=${event.bot.name}`);
    await dispatch(event, (response) => {
      console.log('main response', response);
      callback(null, response)});
  } catch (e) {
    callback(e);
  }
};
