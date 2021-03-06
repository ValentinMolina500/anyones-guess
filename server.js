require('dotenv').config();
require('firebase/database')
const fb = require('firebase/app').default;
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* init firebase */
const config = {
  apiKey: process.env.APP_API_KEY,
  authDomain: process.env.APP_AUTH_DOMAIN,
  databaseURL: process.env.APP_DATABASE_URL,
  projectId: process.env.APP_PROJECT_ID,
  storageBucket: process.env.APP_STORAGE_BUCKET,
  messagingSenderId: process.env.APP_MESSAGING_SENDER_ID,
  appId: process.env.APP_APP_ID
}
fb.initializeApp(config)
console.log('FB INIT!');
const db = fb.database();

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Panda' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  db.ref('/players').push({
    username: req.body.username
  })
  res.send(
    `Added a player dawg!`,
  );
});

app.listen(port, () => console.log(`Listening on port ${port}`));