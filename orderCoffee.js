'use strict'
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const lexResponses = require('./lexResponses');
const placeOrder = require('./firebase');

const types = ['latte', 'americano', 'cappuccino', 'expresso'];
const sizes = ['double', 'normal', 'large'];

function buildValidationResult(isValid, violatedSlot, messageContent) {
  if (messageContent == null) {
    return {
      isValid,
      violatedSlot,
      // options
    };
  }
  return {
    isValid,
    violatedSlot,
    message: { contentType: 'PlainText', content: messageContent },
    // options
  };
}

function validateCoffeeOrder(coffeeType, coffeeSize) {
  if (coffeeType && types.indexOf(coffeeType.toLowerCase()) === -1) {
    // const options = getOptions('Select a coffee', types);
    return buildValidationResult(false, 'coffee', `We do not have ${coffeeType}, would you like a different type of coffee?  Our most popular coffee is americano.`);
  }

  return buildValidationResult(true, null, null);
}

const firebaseConfig = {
  apiKey: "AIzaSyAcnVLNQ_x5nV948TUryhCQVV-jfKYGR5M",
  authDomain: "chatbot-6157b.firebaseapp.com",
  projectId: "chatbot-6157b",
  storageBucket: "chatbot-6157b.appspot.com",
  messagingSenderId: "500336578361",
  appId: "1:500336578361:web:b06be184af9f586a2be2e8"
};

const app = initializeApp(firebaseConfig);
const fireDb = getFirestore(app);

async function addBooking(appointmentData) {
  console.log('creating order');
  let ref = collection(fireDb, "coffeeTable");
  let orderId;
  const docRef = await addDoc(ref, appointmentData)
    .then((item) => {
      console.log("data posted successfully", item.id);
      orderId = item.id;
    })
    .catch((e) => console.log(e));
  // console.log("post successful", docRef);
  // try {
  //   const docRef = await addDoc(ref, appointmentData);
  //   console.log("Document written with ID: ", docRef.id);
  //   orderId = docRef.id;
  // } catch (e) {
  //   console.error("Error adding document: ", e);
  // }
  return orderId;
};

function buildFulfillmentResult(fulfillmentState, messageContent) {
  console.log('inside buildFulfillmentResult')
  return {
    fulfillmentState,
    message: {
      contentType: "PlainText",
      content: messageContent
    }
  };
}

async function fulfillOrder(appointmentData) {
  console.log('inside fulfillOrder')
  const item = await addBooking(appointmentData);
  // return addBooking(appointmentData).then((item) => {
    console.log('item', item);
    return buildFulfillmentResult(
      "Fulfilled",
      `Thank your order has been placed with id ${item}`
    );
  // });
}

module.exports = async function(intentRequest, callback) {
  var coffeeType = intentRequest.currentIntent.slots.coffee;
  console.log(coffeeType);

  const source = intentRequest.invocationSource;
  console.log('source', source);
  
  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;
    const validationResult = validateCoffeeOrder(coffeeType);
    
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message))
      return;
    }

    callback(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  if (source === 'FulfillmentCodeHook') {
    console.log('FulfillmentCodeHook');
    // const order = {
    //   fulfillmentState: 'Fulfilled',
    //   message: {
    //     contentType: 'PlainText',
    //     content: 'Thank you, order has been placed',
    //   }
    // }
    const order = await fulfillOrder({name: coffeeType})
    // .then((order) => {
      console.log('fulfilling order....')
      // console.log("order: ", order);
      // console.log('close response', lexResponses.close(intentRequest.sessionAttributes, order.fulfillmentState, order.message));
      callback(lexResponses.close(intentRequest.sessionAttributes, order.fulfillmentState, order.message))
      return;
    // });
    callback(lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', { contentType: 'PlainText', content: 'Thank you, Order placed' }))
  }
};
