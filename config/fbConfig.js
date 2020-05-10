//import firebase from 'firebase/app';
//import 'firebase/firestore';
//import 'firebase/auth';

const admin = require('firebase-admin')
const serviceAccount = require("./mytwitter-d4927-firebase-adminsdk-aam2a-bcb96dc616.json");


const firebaseConfig = {
    apiKey: "AIzaSyBVhvfEL9Rljwctai9YF-eosn9025BV-mc",
    authDomain: "mytwitter-d4927.firebaseapp.com",
    databaseURL: "https://mytwitter-d4927.firebaseio.com",
    projectId: "mytwitter-d4927",
    storageBucket: "mytwitter-d4927.appspot.com",
    messagingSenderId: "201502672374",
    appId: "1:201502672374:web:c4aaa4ffcc5800048db3d7"

};


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mytwitter-d4927.firebaseio.com"
});

module.exports = { admin }
// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
//firebase.firestore().settings({timestampsInSnapshots:true})


//export default firebase;