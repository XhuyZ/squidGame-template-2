import { io, Socket } from "socket.io-client";

const URL = process.env.REACT_APP_SERVER_URL || "http://157.66.101.42:4000";

export const socket: Socket = io(URL, {
  autoConnect: false,
});
