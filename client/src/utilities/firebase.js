import app from 'firebase/app'
import 'firebase/database'

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
}

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.db = app.database();
    console.log("Firebase init");
  }

  addPlayer = (username) => {
    console.log("adding player...")
    return this.db.ref("/players").push({
      username: username
    });
  }
}

const instance = new Firebase();

export default instance;