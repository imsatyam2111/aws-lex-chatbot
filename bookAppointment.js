'use strict'
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const lexResponses = require('./lexResponses');
const placeOrder = require('./firebase');
const db = require('./db.json');

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

// function validateCoffeeOrder(coffeeType, coffeeSize) {
//   if (coffeeType && types.indexOf(coffeeType.toLowerCase()) === -1) {
//     // const options = getOptions('Select a coffee', types);
//     return buildValidationResult(false, 'coffee', `We do not have ${coffeeType}, would you like a different type of coffee?  Our most popular coffee is americano.`);
//   }

//   return buildValidationResult(true, null, null);
// }

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
  let ref = collection(fireDb, "appointments");
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
      `Your appointment is booked with id ${item}`
    );
  // });
}

function isValidAppointmentType(appointment_type){
  console.log('appointment type:', appointment_type);
  if(appointment_type=='Book an appointment'||appointment_type=='Register patient'||appointment_type=='Urgent Case')
  {
      return true;
  }
  return false;
}

function isValidPatientRelation(patient_relation){
  if(patient_relation.toLowerCase()=="self" || patient_relation.toLowerCase()=="some on else"){
      return true;
  }
  return false;
}
function isValidLocation(location){
  if(location.toLowerCase()=='dallas'||location.toLowerCase()=='austin texas')
  {
      return true;
  }
  return false;
}
function isValidHealthSpecialization(healthSpecialization){
  if(healthSpecialization=='COVID19 Immunization'||healthSpecialization=="Child Immunization"||healthSpecialization=="Dental Clinic")
  {
      return true;
  }
  return false;
}

module.exports = async function(intentRequest, callback) {
  // var coffeeType = intentRequest.currentIntent.slots.coffee;
  // console.log(coffeeType);

  const source = intentRequest.invocationSource;
  console.log('source', source);
  
  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;
    console.log('slots', slots);

    let message = {
      contentType: 'PlainText',
      content: '',
    };
    
    if(slots['appointment_type']==null) {
      var responseCard = {
        'version': null,
        'contentType': 'application/vnd.amazonaws.card.generic',
        'genericAttachments': [{
          'buttons': db.appointmentType
        }]
      }
      message.content="Choose your appointment type."
      callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'appointment_type',message,responseCard))
      return
    } else if(slots['appointment_type']&&slots['patient_relation']==null) {
      if (isValidAppointmentType(slots['appointment_type'])) {
        var responseCard={
            'version': null,
            'contentType': 'application/vnd.amazonaws.card.generic',
            'genericAttachments': [{
                'buttons': db.patientRelation
            }]}
        message.content="Do you want book for self or some one else"
        callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'patient_relation',message,responseCard))
        return      
      } else{
        var responseCard={
          'version': null,
          'contentType': 'application/vnd.amazonaws.card.generic',
          'genericAttachments': [{
              'buttons': db.appointmentType
          }]}
          message.content="Chose correct appointment type..."
          callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'appointment_type',message,responseCard))
        return
      }
    } else if(slots['appointment_type']&&slots['patient_relation']&&slots['healthSpecialization']==null) {
      if (isValidPatientRelation(slots['patient_relation'])) {
        var responseCard={
          'version': null,
          'contentType': 'application/vnd.amazonaws.card.generic',
          'genericAttachments': [{
            'buttons': db.healthSpecialization
        }]}
        message.content="What service are you looking for ?"
        callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'healthSpecialization',message,responseCard))
        return    
      } else{
          var responseCard={
            'version': null,
            'contentType': 'application/vnd.amazonaws.card.generic',
            'genericAttachments': [{
              'buttons': db.patientRelation
          }]}
          message.content="Choose correct patient relation......."
          callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'patient_relation',message,responseCard))
        return
      }
    } else if (slots['appointment_type']&&slots['patient_relation']&&slots['healthSpecialization']&&slots['location']==null) {
      if(isValidHealthSpecialization(slots['healthSpecialization'])) {
          var responseCard={
          'version': null,
          'contentType': 'application/vnd.amazonaws.card.generic',
          'genericAttachments': [{
              'buttons': db.locations
          }]}
          message.content="Sure.... What is Your preferred location"
          callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'location',message,responseCard))
        return
      } else {
          var responseCard={
            'version': null,
            'contentType': 'application/vnd.amazonaws.card.generic',
            'genericAttachments': [{
              'buttons': db.healthSpecialization
          }]}
          message.content="Chose correct health care specialization...."
          callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'healthSpecialization', message, responseCard))
        return
      }
    } else if (slots['appointment_type']&&slots['patient_relation']&&slots['location']&&slots['healthSpecialization']&&slots['doctor_name']==null) {
      if (isValidLocation(slots['location'])) {
          var responseCard={
          'version': null,
          'contentType': 'application/vnd.amazonaws.card.generic',
          'genericAttachments': [{
              'buttons': db.doctorsList
          }]}
          message.content="Got, It. Which doctor you want to consult with ?"
          callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'doctor_name',message,responseCard))
        return
      } else {
        var responseCard={
          'version': null,
          'contentType': 'application/vnd.amazonaws.card.generic',
          'genericAttachments': [{
            'buttons': db.locations
          }]}
          message.content="Choose correct locations "
          callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'location',message,responseCard))
        return
      } 
    } else if(slots['appointment_type']&&slots['patient_relation']&&slots['location']&&slots['healthSpecialization']&&slots['doctor_name']&&slots['date_of_appointment']==null){
      var responseCard={
        'version': null,
        'contentType': 'application/vnd.amazonaws.card.generic',
        'genericAttachments': [{
            'buttons': db.dateOfAppointment
      }]}
      message.content="Choose Date..."
      callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'date_of_appointment',message,responseCard))
      return
    }
    else if(slots['appointment_type']&&slots['patient_relation']&&slots['location']&&slots['healthSpecialization']&&slots['doctor_name']&&slots['chooseSlots']==null){
      var responseCard={
      'version': null,
      'contentType': 'application/vnd.amazonaws.card.generic',
      'genericAttachments': [{
          'buttons': db.chooseSlots
      }]}
      message.content="Choose Slots..."
      callback(lexResponses.elicitSlot(intentRequest.sessionAttributes,intentRequest.currentIntent.name, slots, 'chooseSlots',message,responseCard))
      return
    }
    // callback(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message))
    callback(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  if (source === 'FulfillmentCodeHook') {
    console.log('FulfillmentCodeHook');
    let appointmentData = {};
    appointmentData.service = intentRequest.currentIntent.slots.healthSpecialization;
    appointmentData.location = intentRequest.currentIntent.slots.location;
    appointmentData.doctorName = intentRequest.currentIntent.slots.doctor_name;
    appointmentData.appointmentDateTime = `${intentRequest.currentIntent.slots.date_of_appointment} ${intentRequest.currentIntent.slots.chooseSlots}`;
    appointmentData.createdAt = new Date();
    // const order = {
    //   fulfillmentState: 'Fulfilled',
    //   message: {
    //     contentType: 'PlainText',
    //     content: 'Thank you, order has been placed',
    //   }
    // }
    console.log('appointemntDat', appointmentData)
    // const payloadData = { ...appointmentData, createdAt: new Date() }
    // console.log('payloadData', payloadData);
    const bookedAppointment = await fulfillOrder(appointmentData)
    // .then((order) => {
      console.log('registering appointment....', bookedAppointment);
      // console.log("order: ", order);
      // console.log('close response', lexResponses.close(intentRequest.sessionAttributes, order.fulfillmentState, order.message));
      callback(lexResponses.close(intentRequest.sessionAttributes, bookedAppointment.fulfillmentState, bookedAppointment.message))
      return;
    // });
    callback(lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', { contentType: 'PlainText', content: 'Thank you, Order placed' }))
  }
};
