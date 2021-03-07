import { io } from "socket.io-client";

const production = window.location.toString();
const dev = "http://localhost:8080";
let url;
if (process.env.NODE_ENV === "production") {
  url = production;
} else {
  url = dev;
}


const socket = io(url, { autoConnect: false });


export default socket;