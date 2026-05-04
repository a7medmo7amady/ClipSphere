import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import config from "../config/env";
import User from "../models/User";

let io: Server;
const userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const initWebSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl || "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token || typeof token !== "string") {
        return next(new Error("Authentication error: Token missing"));
      }

      const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
      const user = await User.findById(payload.id);

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      (socket as any).userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId;

    if (userId) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);

      console.log(`User connected: ${userId} (${socket.id})`);
    }

    socket.on("disconnect", () => {
      if (userId && userSockets.has(userId)) {
        userSockets.get(userId)!.delete(socket.id);
        if (userSockets.get(userId)!.size === 0) {
          userSockets.delete(userId);
        }
        console.log(`User disconnected: ${userId} (${socket.id})`);
      }
    });
  });

  return io;
};

export const sendToUser = (userId: string, event: string, data: any) => {
  if (io && userSockets.has(userId)) {
    const sockets = userSockets.get(userId)!;
    sockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
};
