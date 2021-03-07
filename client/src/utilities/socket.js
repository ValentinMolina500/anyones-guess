import { io } from "socket.io-client";

const production = "https://anyones-guess-80.herokuapp.com:8080/"
const dev = "http://localhost:8080";
let url;
if (process.env.NODE_ENV === "production") {
  url = production;
} else {
  url = dev;
}

const socket = io(window.location, { autoConnect: false });
socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;