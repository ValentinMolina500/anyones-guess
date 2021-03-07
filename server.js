
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

const playerOne = null;
const playerTwo = null;
const users = [];
const status = Status.WAITING_FOR_PLAYERS;

io.on("connection", (socket) => {
  // fetch existing users
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
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
});


const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "client", "build")));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"))
})

http.listen(PORT, () =>
  console.log(`server listening at http://localhost:${PORT}`)
);