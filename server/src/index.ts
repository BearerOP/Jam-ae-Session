import express from "express";
import { WebSocketServer } from "ws";
import SessionManager from './session';
import { config } from "dotenv";
import prisma from "./db";
import router from "./routes";


const app = express();
config();

app.use(express.json());

prisma.$connect().then(() => {
  console.log("Connected to database");
}
).catch((error) => {
  console.error("Error connecting to database:", error);
});
app.use("/api", router);


const httpServer = app.listen(8080);


const wss = new WebSocketServer({ server: httpServer });
const sessionManager = new SessionManager();

let userIdCounter = 1; // Initialize counter for user IDs

wss.on("connection", function connection(ws) {
  console.log("New client connected");
  const userId = String(userIdCounter++); // Convert to string and increment

  ws.on("error", console.error);

  ws.on("message", function message(data) {
    try {
      const parsedData = JSON.parse(data.toString());

      if (parsedData.event === "join_session") {
        const { username, sessionId } = parsedData.data;
        sessionManager.joinSession(sessionId, {
          id: userId,
          username,
          ws: ws as unknown as WebSocket
        });
      } else if (parsedData.event === "leave_session") {
        const { sessionId } = parsedData.data;
        sessionManager.leaveSession(sessionId, userId);
      } else {
        // Broadcast message to session
        const { sessionId, message } = parsedData.data;
        sessionManager.broadcastMessage(sessionId, message);
      }
    } catch (error) {
      console.error("Invalid JSON message received:", error);
    }
  });

  ws.send(JSON.stringify({ 
    event: "server_message", 
    data: { 
      message: "Welcome to WebSocket Server!",
      userId 
    } 
  }));
});
