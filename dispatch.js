const orderCoffee = require('./orderCoffee');
const bookAppointment = require('./bookAppointment');

module.exports = async function(intentRequest, callback) {
  console.log(`dispatch userId = ${intentRequest.userId}, intentName = ${intentRequest.currentIntent.name}`);
  const intentName = intentRequest.currentIntent.name;

  if (intentName === 'CoffeeOrder') {
    console.log(intentName + ' was called');
    return await orderCoffee(intentRequest, callback);
  }

  if (intentName === 'BookingAppointment') {
    console.log(intentName + ' was called');
    return await bookAppointment(intentRequest, callback)
  }

  throw new Error(`Intent with name ${intentName} is not supported`);
}