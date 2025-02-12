import WebSocket from 'ws';
import { SessionUser } from './types/user';

class SessionManager {
  private sessions: Map<string, SessionUser[]>;

  constructor() {
    this.sessions = new Map();
  }

  joinSession(sessionId: string, user: SessionUser): void {
    
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
    this.sessions.get(sessionId)?.push(user);
    console.log(`User ${user.username} joined session ${sessionId}`);
    
    this.broadcastToSession(sessionId, {
      event: 'join_session',
      data: {
        message: `User ${user.username} joined the session!`,
        userId: user.id,
      }
    });
  }

  leaveSession(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      const userIndex = session.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        const user = session[userIndex];
        session.splice(userIndex, 1);
        this.broadcastToSession(sessionId, {
          event: 'leave_session',
          data: {
            message: `User ${user.username} left the session!`,
            userId: user.id,
          }
        });
      }
    }
  }

  private broadcastToSession(sessionId: string, message: any): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.forEach(user => {
        if (user.ws.readyState === WebSocket.OPEN) {
          user.ws.send(JSON.stringify(message));
        }
      });
    }
  }

  broadcastMessage(sessionId: string, message: any): void {
    this.broadcastToSession(sessionId, {
      event: 'broadcast',
      data: message
    });
  }
}

export default SessionManager; 