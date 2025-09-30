import { io, Socket } from "socket.io-client";

const URL = process.env.REACT_APP_SERVER_URL || "https://mln.xhuyz.me:4000";

export const socket: Socket = io(URL, {
  autoConnect: false,
});
