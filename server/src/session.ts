import WebSocket from "ws";

class SessionManager {
  private sessions: Map<
    string,
    {
      users: Map<string, WebSocket>;
      queue: string[];
      currentVideo: string | null;
      startTime: number;
    }
  >;

  constructor() {
    this.sessions = new Map();
  }

  joinSession(sessionId: string, userId: string, ws: WebSocket): void {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        users: new Map(),
        queue: [],
        currentVideo: null,
        startTime: 0,
      });
    }

    const session = this.sessions.get(sessionId)!;

    if (!session.users.has(userId)) {
      session.users.set(userId, ws);
      console.log(`User ${userId} joined session ${sessionId}`);

      this.broadcastToSession(sessionId, {
        event: "join_session",
        data: { message: `User ${userId} joined the session!`, userId },
      });

      // Sync the new user with the current playing video and timestamp
      if (session.currentVideo) {
        ws.send(
          JSON.stringify({
            event: "sync_video",
            data: {
              videoUrl: session.currentVideo,
              timestamp: (Date.now() - session.startTime) / 1000,
            },
          })
        );
      }
    }
  }

  leaveSession(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.users.has(userId)) {
      session.users.delete(userId);
      console.log(`User ${userId} left session ${sessionId}`);

      this.broadcastToSession(sessionId, {
        event: "leave_session",
        data: { message: `User ${userId} left the session!`, userId },
      });

      if (session.users.size === 0) {
        this.sessions.delete(sessionId);
      }
    }
  }

  addVideoToQueue(sessionId: string, videoUrl: string): void {
    
    const session = this.sessions.get(sessionId);
    console.log(session);
    
    if (session) {
      session.queue.push(videoUrl);
      console.log(`Added video to queue in session ${sessionId}: ${videoUrl}`);
      console.log(session.queue);
      console.log(!session.currentVideo);
      
      console.log("addVideoToQueue");
      if (!session.currentVideo) {
        this.playNextVideo(sessionId);
      } else {
        this.broadcastToSession(sessionId, {
          event: "queue_updated",
          data: { queue: session.queue },
        });
      }
    }
  }

  playNextVideo(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.queue.length > 0) {
      session.currentVideo = session.queue.shift()!;
      session.startTime = Date.now();

      this.broadcastToSession(sessionId, {
        event: "play_video",
        data: { videoUrl: session.currentVideo },
      });

      console.log(
        `Playing video in session ${sessionId}: ${session.currentVideo}`
      );
    }
  }

  syncTimestamp(sessionId: string): number {
    const session = this.sessions.get(sessionId);
    if (!session || !session.currentVideo) return 0;
    return (Date.now() - session.startTime) / 1000;
  }

  broadcastToSession(sessionId: string, message: any): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.users.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  broadcastMessage(sessionId: string, message: any): void {
    this.broadcastToSession(sessionId, {
      event: "broadcast",
      data: message,
    });
  }

}

export default SessionManager;
