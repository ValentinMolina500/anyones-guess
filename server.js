
const path = require("path");
const express = require("express");
const app = express();
const http = require('http').createServer(app);

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

const Status = {
  WAITING_FOR_PLAYERS: 0,
  IN_GAME: 1
};

let users = [];

/* Game variables */
let status = Status.WAITING_FOR_PLAYERS;
let playerOne = null;
let playerTwo = null;
let currentPlayerTurn = null;
let playerOneNoun = null;
let playerTwoNoun = null;
/* Util functions */
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const startGame = () => {
  const randomOne = getRandomInt(users.length);
  let randomTwo;
  do {
    randomTwo = getRandomInt(users.length);
  } while (randomTwo === randomOne)

  playerOne = users[randomOne];
  playerTwo = users[randomTwo];
  status = Status.IN_GAME;
  currentPlayerTurn = playerOne

  const categories = ['Actors', 'Athletes', 'Animals'];

  var dict = { 
    'Actors' : ['Tom Hanks', 'The Rock', 'Keanu Reeves', 'Scarlett Johansson', 'Ellen Pompeo'],
    'Athletes' : ['LeBron James', 'Serena Williams', 'Allyson Felix', 'Tom Brady', 'Conor McGregor'],
    'Animals' : ['Dog', 'Cat', 'Lion', 'Fish', 'Bird']
  };

  var randCat = categories[getRandomInt(categories.length)];

  var cat1 = dict[randCat];
  cat1 = cat1[getRandomInt(cat1.length)];
  
  var cat2 = dict[randCat];
  cat2 = cat2[getRandomInt(cat2.length)];
  
  while (cat1 === cat2){
    cat2 = dict[randCat];
    cat2 = cat2[getRandomInt(cat2.length)];
  }

  playerOneNoun = cat1;
  playerTwoNoun = cat2;

  setGameStatus({
    playerOne,
    playerTwo,
    status,
    currentPlayerTurn,
    playerOneNoun,
    playerTwoNoun
  });
}


const setGameStatus = (value) => {
  io.emit("game state", value);
}
io.on("connection", (socket) => {
  // fetch existing users
  // const users = []
  // for (let [id, socket] of io.of("/").sockets) {
  //   users.push({
  //     userID: id,
  //     username: socket.username,
  //   });
  // }
  users.push({
    userID: socket.id,
    username: socket.username
  });

  console.log(users);

  socket.emit("users", users);
  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });

  // forward the private message to the right recipient
  socket.on("private message", ({ content, to }) => {
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    });
  });

  // notify users upon disconnection
  socket.on("disconnect", () => {
    users = users.filter((user) => user.userID !== socket.id);
    socket.broadcast.emit("user disconnected", socket.id);
  });

  // notify users upon message
  socket.on("message sent", (msg) => {
    console.log("message sent: ", msg);
    const message = {
      content: msg,
      id: socket.id,
      timestamp: new Date(),
      username: socket.username
    }

    io.emit("new message", message)
  })

  if (users.length > 2 && status !== Status.IN_GAME) {
    console.log("starting game")
    startGame();
  } else {
    setGameStatus({
      playerOne,
      playerTwo,
      status,
      currentPlayerTurn,
      playerOneNoun,
      playerTwoNoun
    })
  }
  
  // if (users.length > 2 || status !== Status.IN_GAME) {
  //   console.log("Starting game with...\n");
  //   console.log(JSON.stringify({
  //     playerOne,
  //     playerTwo,
  //     status,
  //     currentPlayerTurn,
  //     playerOneNoun,
  //     playerTwoNoun
  //   }))
  //   startGame();
  // } else {
  //   setGameStatus({
  //     playerOne,
  //     playerTwo,
  //     status,
  //     currentPlayerTurn,
  //     playerOneNoun,
  //     playerTwoNoun
  //   })
  // }
});


const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "client", "build")));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"))
})

http.listen(PORT, () =>
  console.log(`server listening at http://localhost:${PORT}`)
);

