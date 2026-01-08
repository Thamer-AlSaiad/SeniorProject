/* eslint-disable prettier/prettier */
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';

export interface TranscriptionResult {
  type: 'partial' | 'final' | 'error';
  text: string;
  sessionId: string;
}

interface WhisperSession {
  ws: WebSocket;
  sessionId: string;
  lastActivity: number;
  onResult: (result: TranscriptionResult) => void;
}

/**
 * WhisperClientService manages WebSocket connections to the Python Whisper server.
 * It handles connection pooling, reconnection, and message routing.
 */
@Injectable()
export class WhisperClientService implements OnModuleDestroy {
  private readonly logger = new Logger(WhisperClientService.name);
  private readonly whisperUrl: string;
  private readonly sessions = new Map<string, WhisperSession>();
  private readonly maxConcurrentSessions: number;
  private readonly sessionTimeout = 30000; // 30 minutes

  constructor(private readonly configService: ConfigService) {
    this.whisperUrl = this.configService.get<string>('WHISPER_SERVER_URL') || 'ws://localhost:8000/ws/transcribe';
    this.maxConcurrentSessions = this.configService.get<number>('WHISPER_MAX_SESSIONS') || 10;
    
    // Cleanup stale sessions periodically
    setInterval(() => this.cleanupStaleSessions(), 60000);
  }

  onModuleDestroy() {
    // Close all sessions on shutdown
    for (const [sessionId] of this.sessions) {
      this.closeSession(sessionId);
    }
  }

  /**
   * Get current session count for monitoring
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Check if we can accept new sessions
   */
  canAcceptSession(): boolean {
    return this.sessions.size < this.maxConcurrentSessions;
  }

  /**
   * Create a new transcription session
   */
  async createSession(
    sessionId: string,
    onResult: (result: TranscriptionResult) => void,
  ): Promise<boolean> {
    if (this.sessions.has(sessionId)) {
      this.logger.warn(`Session ${sessionId} already exists`);
      return true;
    }

    if (!this.canAcceptSession()) {
      this.logger.warn(`Max concurrent sessions (${this.maxConcurrentSessions}) reached`);
      onResult({
        type: 'error',
        text: 'Server busy - too many concurrent transcription sessions',
        sessionId,
      });
      return false;
    }

    return new Promise((resolve) => {
      const ws = new WebSocket(this.whisperUrl);

      ws.on('open', () => {
        this.logger.log(`Whisper session ${sessionId} connected`);
        this.sessions.set(sessionId, {
          ws,
          sessionId,
          lastActivity: Date.now(),
          onResult,
        });
        resolve(true);
      });

      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          const session = this.sessions.get(sessionId);
          if (session) {
            session.lastActivity = Date.now();
            session.onResult({
              type: message.type,
              text: message.text || '',
              sessionId,
            });
          }
        } catch (err) {
          this.logger.error(`Failed to parse Whisper response: ${err}`);
        }
      });

      ws.on('error', (err: Error) => {
        this.logger.error(`Whisper session ${sessionId} error: ${err.message}`);
        onResult({
          type: 'error',
          text: 'Transcription service error',
          sessionId,
        });
      });

      ws.on('close', () => {
        this.logger.log(`Whisper session ${sessionId} closed`);
        this.sessions.delete(sessionId);
      });

      // Timeout for connection
      setTimeout(() => {
        if (!this.sessions.has(sessionId)) {
          ws.close();
          onResult({
            type: 'error',
            text: 'Failed to connect to transcription service',
            sessionId,
          });
          resolve(false);
        }
      }, 5000);
    });
  }

  /**
   * Send audio data to Whisper for transcription
   */
  sendAudio(sessionId: string, audioBase64: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.ws.readyState !== WebSocket.OPEN) {
      this.logger.warn(`Cannot send audio - session ${sessionId} not ready`);
      return false;
    }

    session.lastActivity = Date.now();
    session.ws.send(JSON.stringify({ type: 'audio', audio: audioBase64 }));
    return true;
  }

  /**
   * Signal end of transcription and get final result
   */
  stopTranscription(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    session.ws.send(JSON.stringify({ type: 'stop' }));
    return true;
  }

  /**
   * Close a transcription session
   */
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (session.ws.readyState === WebSocket.OPEN) {
        session.ws.close();
      }
      this.sessions.delete(sessionId);
      this.logger.log(`Session ${sessionId} closed`);
    }
  }

  /**
   * Cleanup sessions that have been inactive too long
   */
  private cleanupStaleSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.logger.warn(`Cleaning up stale session ${sessionId}`);
        this.closeSession(sessionId);
      }
    }
  }
}
