const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");

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

module.exports.addBooking = async (appointmentData) => {
  console.log('creating order');
  let ref = collection(fireDb, "coffeeTable");
  let orderId;
  // const docRef = await addDoc(ref, appointmentData)
  //   .then(() => {
  //     console.log("data posted successfully");
  //   })
  //   .catch((e) => console.log(e));
  // console.log("post successful", docRef);
  try {
    const docRef = await addDoc(ref, appointmentData);
    console.log("Document written with ID: ", docRef.id);
    orderId = docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
  return orderId;
};

module.exports.createBooking = async () => {
  console.log('create booking')
  return 583424;
}
