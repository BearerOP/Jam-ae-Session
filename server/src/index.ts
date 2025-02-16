import express from "express";
import { WebSocketServer } from "ws";
import SessionManager from "./session";
import { config } from "dotenv";
import prisma from "./db";
import router from "./routes";

const app = express();
config();

app.use(express.json());

prisma
  .$connect()
  .then(() => console.log("Connected to database"))
  .catch((error) => console.error("Error connecting to database:", error));

app.get("/", (req, res) => {
  res.send("Root route by Jam-ऐ-Session Server");
});

app.use("/api", router);

const httpServer = app.listen(8080, () => {
  console.log("Server listening on port 8080");
});

const wss = new WebSocketServer({ server: httpServer });
const sessionManager = new SessionManager();

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("error", console.error);

  ws.on("message", (data) => {
    try {
      const parsedData = JSON.parse(data.toString());

      switch (parsedData.event) {
        case "join_session":
          sessionManager.joinSession(
            parsedData.data.sessionId,
            parsedData.data.userId,
            ws
          );
          break;

        case "leave_session":
          sessionManager.leaveSession(
            parsedData.data.sessionId,
            parsedData.data.userId
          );
          break;

        case "message":
          sessionManager.broadcastMessage(
            parsedData.data.sessionId,
            parsedData.data.message
          );
          break;

        default:
          console.warn("Unknown event:", parsedData.event);
      }
    } catch (error) {
      console.error("Invalid JSON message received:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    
  });

  ws.send(
    JSON.stringify({
      event: "server_message",
      data: { message: "Welcome to WebSocket Server!" },
    })
  );
});
