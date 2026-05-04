import { initWebSocket, sendToUser } from "../../src/infrastructure/websocket";
import http from "http";
import { io as client } from "socket.io-client";
import jwt from "jsonwebtoken";
import config from "../../src/config/env";
import User from "../../src/models/User";

// Mock User model
jest.mock("../../src/models/User");

describe("WebSocket Infrastructure Integration", () => {
  let httpServer: http.Server;
  let io: any;
  const port = 5002;
  const mockUserId = "507f1f77bcf86cd799439011";
  let token: string;

  beforeAll((done) => {
    httpServer = http.createServer();
    io = initWebSocket(httpServer);
    httpServer.listen(port, done);

    token = jwt.sign({ id: mockUserId }, config.jwtSecret);
  });

  afterAll((done) => {
    io.close();
    httpServer.close(done);
  });

  it("should allow authenticated connection and receive messages", (done) => {
    (User.findById as jest.Mock).mockResolvedValue({ _id: mockUserId });

    const clientSocket = (client as any)(`http://localhost:${port}`, {
      auth: { token },
      transports: ["websocket"],
    });

    clientSocket.on("connect", () => {
      // Once connected, test sending a message to this user
      const testData = { hello: "world" };
      
      clientSocket.on("test-event", (data: any) => {
        expect(data).toEqual(testData);
        clientSocket.disconnect();
        done();
      });

      // We need a small delay to ensure the server-side mapping is updated
      setTimeout(() => {
        sendToUser(mockUserId, "test-event", testData);
      }, 50);
    });

    clientSocket.on("connect_error", (err: any) => {
      done(err);
    });
  });

  it("should reject unauthenticated connection", (done) => {
    const clientSocket = (client as any)(`http://localhost:${port}`, {
      auth: { token: "invalid-token" },
      transports: ["websocket"],
    });

    clientSocket.on("connect_error", (err: any) => {
      expect(err.message).toContain("Authentication error");
      clientSocket.disconnect();
      done();
    });
  });
});
