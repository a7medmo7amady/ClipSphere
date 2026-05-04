import { Server, type Socket } from "socket.io";
import { createServer, type Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import config from "./env";

let _io: Server | null = null;

export function initSocketIO(httpServer: HttpServer): Server {
  _io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  _io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = jwt.verify(token, config.jwtSecret) as { id: string };
      socket.data.userId = payload.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  _io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    socket.join(userId);

    socket.on("disconnect", () => {
      socket.leave(userId);
    });
  });

  return _io;
}

export function getIO(): Server {
  if (!_io) throw new Error("Socket.IO not initialized");
  return _io;
}
