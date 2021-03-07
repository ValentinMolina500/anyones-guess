
const path = require("path");
const express = require("express");
const e = require("express");
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

const TurnStatus = {
  PLAYER1_ASK: 0,
  PLAYER1_RESPONSE: 1,
  PLAYER2_ASK: 2,
  PLAYYER2_RESPONSE: 3
}

let users = [];

/* Game variables */
let status = Status.WAITING_FOR_PLAYERS;
let turnStatus = null;
let playerOne = {};
let playerTwo = {};
let currentPlayerTurn = null;
let playerOneNoun = null;
let playerTwoNoun = null;
let fsm2_list = [];
let fsm4_list = [];
let playerOneTries = -1;
let playerTwoTries = -1;
let gameover = null;


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

  turnStatus = TurnStatus.PLAYER1_ASK
  playerOne = users[randomOne];
  playerTwo = users[randomTwo];
  status = Status.IN_GAME;
  currentPlayerTurn = playerOne

  const categories = ['Celebrities', 'Athletes', 'Animals', 'Pokemon'];

  var dict = { 
    'Celebrities' : ['Jensen Ackles','Andre 3000','Naveen Andrews','Jensen Atwood','Tyler Bachtel','Penn Badgley','Simon Baker','Christian Bale','Eric Balfour','Eric Bana','Alex Band','Antonio Banderas','Ike Barinholtz','Ben Barnes','Eugen Bauder','William Beckett','Tyson Beckford','David Beckham','Jason Behr','Jonathan Bennett ','Sam Bennett ','Dierks Bentley','Gael Garcia Bernal','Jon Bernthal','Wilson Bethel ','Justin Bieber','David Blaine','James Blake','Corbin Bleu','Orlando Bloom','Jon Bon Jovi','Asher Book','David Boreanaz','Tom Bott','Raoul Bova','Bow Wow','Marlon Brando','Adam Brody','Chris Brown','Michel Brown','Justin Bruening','Austin Butler ','Gerard Butler','Santiago Cabrera','Bobby Cannavale ','Nick Cannon','Robert Carmine','Chris Carmack','Ryan Carnes','Anthony Catanzaro','Tom Hanks','The Rock','Keanu Reeves','Scarlett Johansson','Ellen Pompeo'],
    'Athletes' : ['Muhammad Ali', 'Usain Bolt', 'Michael Jordan', 'Serena Williams', 'Michael Phelps', 'Roger Federer', 'Lionel Messi', 'Ronda Rousey','Allen Iverson','Wayne Gretzky','Michael Vick','Joe DiMaggio','John Elway','Conor McGregor','Lebron James','Alison Felix'],
    'Animals' : ['Dog', 'Cat', 'Lion', 'Fish', 'Bird', 'Canidae','Felidae', 'Cattle', 'Donkey', 'Goat', 'Guinea Pig', 'Horse', 'Pig', 'Rabbit'],
    'Pokemon' : ['Bulbasaur','Ivysaur','Venusaur','Charmander','Charmeleon','Charizard','Squirtle','Wartortle','Blastoise','Caterpie','Metapod','Butterfree','Weedle','Kakuna','Beedrill','Pidgey','Pidgeotto','Pidgeot','Rattata','Raticate','Spearow','Fearow','Ekans','Arbok','Pikachu','Raichu','Sandshrew','Sandslash']
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
  playerOneTries = 6;
  playerTwoTries = 6;
  gameover = false 

  setGameStatus({
    playerOne,
    playerTwo,
    status,
    currentPlayerTurn,
    playerOneNoun,
    playerTwoNoun,
    turnStatus,
    fsm2_list,
    fsm4_list,
    playerOneTries,
    playerTwoTries,
    gameover
  });
}


const setGameStatus = (value) => {
  io.emit("game state", value);

  if (status === Status.IN_GAME) {
    io.emit("new message", {
      type: "system",
      content: `GAME START, Player 1: ${playerOne.username}, Player 2: ${playerTwo.username}`
    });

    io.emit("new message", {
      type: "system",
      content: `Player 1 ask`
    });
    
  }
  
}

const restartGame = (value) => {
  status = Status.WAITING_FOR_PLAYERS;
turnStatus = null;
playerOne = {};
 playerTwo = {};
 currentPlayerTurn = null;
playerOneNoun = null;
playerTwoNoun = null;
fsm2_list = [];
 fsm4_list = [];
playerOneTries = -1;
 playerTwoTries = -1;
 gameover = null;

 io.emit("game state", {
  playerOne,
  playerTwo,
  status,
  currentPlayerTurn,
  playerOneNoun,
  playerTwoNoun,
  turnStatus,
  fsm2_list,
  fsm4_list,
  playerOneTries,
  playerTwoTries,
  gameover
 });
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
    if (users.length < 3) {
      io.emit("new message", {
        type: "system",
        content: "ENDING GAME (NOT ENOUGH PLAYERS)"
      })
      restartGame();
    } 
    socket.broadcast.emit("user disconnected", socket.id);
  });

  // notify users upon message
  socket.on("message sent", (msg) => {
    console.log("message sent: ", msg);
    const message = {
      content: msg,
      id: socket.id,
      timestamp: new Date(),
      username: socket.username,
      type: 'regular'
    }

    io.emit("new message", message)
  })

  // FSM 1 
  socket.on("player one ask", (msg) => {
   
    const message = {
      content: msg,
      id: socket.id,
      timestamp: new Date(),
      username: socket.username,
      type: 'playerOneAsk'
    }
    
    turnStatus = TurnStatus.PLAYER1_RESPONSE;
    fsm2_list = users.filter(user => user.userID !== playerOne.userID);
    
    io.emit("game state", {
      playerOne,
      playerTwo,
      status,
      currentPlayerTurn,
      playerOneNoun,
      playerTwoNoun,
      turnStatus,
      fsm2_list,
      fsm4_list,
      playerOneTries,
      playerTwoTries,
      gameover
    })

   
    io.emit("new message", message)
    io.emit("new message", {
      type: "system",
      content: `Others respond`
    });
  })

  // FSM 2
  socket.on("player one response", (msg) => {
    /* Create the message */
    const message = {
      content: msg,
      id: socket.id,
      timestamp: new Date(),
      username: socket.username,
      type: 'regular'
    }

    /* Remove user from list */
    fsm2_list = fsm2_list.filter(user => socket.id !== user.userID);
    io.emit("new message", message);
    if (fsm2_list.length === 0) {
      io.emit("new message", {
        type: "system",
        content: `Player 2 ask`
      });
      turnStatus = TurnStatus.PLAYER2_ASK;
    }
    io.emit("game state", {
      playerOne,
      playerTwo,
      status,
      currentPlayerTurn,
      playerOneNoun,
      playerTwoNoun,
      turnStatus,
      fsm2_list,
      fsm4_list,
      playerOneTries,
      playerTwoTries,
      gameover
    })
  })

  // FSM 3
  socket.on("player two ask", (msg) => {
    const message = {
      content: msg,
      id: socket.id,
      timestamp: new Date(),
      username: socket.username,
      type: 'playerTwoAsk'
    }

    
    turnStatus = TurnStatus.PLAYER2_RESPONSE;
    fsm4_list = users.filter(user => user.userID !== playerTwo.userID);
    
    io.emit("new message", message)
    io.emit("new message", {
      type: "system",
      content: `Others respond`
    });
    io.emit("game state", {
      playerOne,
      playerTwo,
      status,
      currentPlayerTurn,
      playerOneNoun,
      playerTwoNoun,
      turnStatus,
      fsm2_list,
      fsm4_list,
      playerOneTries,
      playerTwoTries,
      gameover
    })
    
  })

  socket.on("player two response", (msg) => {
    /* Create the message */
    const message = {
      content: msg,
      id: socket.id,
      timestamp: new Date(),
      username: socket.username,
      type: 'regular'
    }

    /* Remove user from list */
    fsm4_list = fsm4_list.filter(user => socket.id !== user.userID);
    io.emit("new message", message);

    if (fsm4_list.length === 0) {
      io.emit("new message", {
        type: "system",
        content: `Player 1 ask`
      });
      turnStatus = TurnStatus.PLAYER1_ASK;
    }
    io.emit("game state", {
      playerOne,
      playerTwo,
      status,
      currentPlayerTurn,
      playerOneNoun,
      playerTwoNoun,
      turnStatus,
      fsm2_list,
      fsm4_list,
      playerOneTries,
      playerTwoTries,
      gameover
    })
  })

  if (users.length > 2 && status !== Status.IN_GAME) {
    console.log("starting game")
    startGame();
  } else {
    restartGame();
  }
  
  socket.on("player one guess", (guess) => {
    io.emit("new message", {
      content: guess,
      type: "guess",
      username: socket.username
    })
    if (guess.trim().toLowerCase() === playerOneNoun.toLowerCase()) {
      io.emit("game win", playerOne)
    } else {
      playerOneTries--;
      if (playerOneTries === 0) {
        io.emit("game win", playerTwo);
      } else {
        io.emit("game state", {
          playerOne,
          playerTwo,
          status,
          currentPlayerTurn,
          playerOneNoun,
          playerTwoNoun,
          turnStatus,
          fsm2_list,
          fsm4_list,
          playerOneTries,
          playerTwoTries,
          gameover
        })
      }

      
    }
  })

  socket.on("player two guess", (guess) => {
    io.emit("new message", {
      content: guess,
      type: "guess",
      username: socket.username
    })
    if (guess.trim().toLowerCase() === playerTwoNoun.toLowerCase()) {
      io.emit("game win", playerTwo)
    } else {
      playerTwoTries--;
      if (playerTwoTries === 0) {
        io.emit("game win", playerOne);
      } else {
        
        io.emit("game state", {
          playerOne,
          playerTwo,
          status,
          currentPlayerTurn,
          playerOneNoun,
          playerTwoNoun,
          turnStatus,
          fsm2_list,
          fsm4_list,
          playerOneTries,
          playerTwoTries,
          gameover
        })
      }

      
    }
  })
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

