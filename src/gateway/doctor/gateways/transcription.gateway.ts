import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WhisperClientService, TranscriptionResult } from '../../../core/services/transcription/whisper-client.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  organizationId?: string;
  sessionId?: string;
}

/**
 * TranscriptionGateway handles real-time audio transcription via WebSocket.
 * 
 * Flow:
 * 1. Client connects and authenticates
 * 2. Client sends 'start-transcription' to begin a session
 * 3. Client sends 'audio-chunk' with base64 audio data every few seconds
 * 4. Server forwards to Whisper and returns partial transcriptions
 * 5. Client sends 'stop-transcription' to get final result
 * 
 * Concurrency is managed by WhisperClientService which limits max sessions.
 */
@WebSocketGateway({
  namespace: '/transcription',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class TranscriptionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TranscriptionGateway.name);
  private readonly clientSessions = new Map<string, string>(); // socketId -> sessionId

  constructor(private readonly whisperClient: WhisperClientService) {}

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Extract auth token from handshake
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization;
    
    if (!token) {
      this.logger.warn(`Client ${client.id} connected without auth token`);
      // For now, allow connection but track it
      // In production, you'd validate JWT here
    }

    // Send connection status
    client.emit('connected', {
      message: 'Connected to transcription service',
      activeSessions: this.whisperClient.getActiveSessionCount(),
      canStart: this.whisperClient.canAcceptSession(),
    });
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Cleanup any active session
    const sessionId = this.clientSessions.get(client.id);
    if (sessionId) {
      this.whisperClient.closeSession(sessionId);
      this.clientSessions.delete(client.id);
    }
  }

  @SubscribeMessage('start-transcription')
  async handleStartTranscription(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { encounterId?: string },
  ) {
    // Check if client already has a session
    if (this.clientSessions.has(client.id)) {
      client.emit('transcription-error', {
        message: 'Session already active',
      });
      return;
    }

    // Generate unique session ID
    const sessionId = `${client.id}-${Date.now()}`;
    
    // Create callback for transcription results
    const onResult = (result: TranscriptionResult) => {
      if (result.type === 'error') {
        client.emit('transcription-error', { message: result.text });
      } else {
        client.emit('transcription-result', {
          type: result.type,
          text: result.text,
        });
      }
    };

    // Try to create session
    const success = await this.whisperClient.createSession(sessionId, onResult);
    
    if (success) {
      this.clientSessions.set(client.id, sessionId);
      client.emit('transcription-started', {
        sessionId,
        message: 'Transcription session started',
      });
      this.logger.log(`Transcription session started: ${sessionId}`);
    } else {
      client.emit('transcription-error', {
        message: 'Failed to start transcription - server may be busy',
      });
    }
  }

  @SubscribeMessage('audio-chunk')
  handleAudioChunk(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { audio: string },
  ) {
    const sessionId = this.clientSessions.get(client.id);
    
    if (!sessionId) {
      client.emit('transcription-error', {
        message: 'No active transcription session',
      });
      return;
    }

    if (!data.audio) {
      return;
    }

    const success = this.whisperClient.sendAudio(sessionId, data.audio);
    
    if (!success) {
      client.emit('transcription-error', {
        message: 'Failed to send audio - session may have expired',
      });
      this.clientSessions.delete(client.id);
    }
  }

  @SubscribeMessage('stop-transcription')
  handleStopTranscription(@ConnectedSocket() client: AuthenticatedSocket) {
    const sessionId = this.clientSessions.get(client.id);
    
    if (!sessionId) {
      client.emit('transcription-error', {
        message: 'No active transcription session',
      });
      return;
    }

    this.whisperClient.stopTranscription(sessionId);
    
    // Give time for final result, then cleanup
    setTimeout(() => {
      this.whisperClient.closeSession(sessionId);
      this.clientSessions.delete(client.id);
    }, 2000);

    this.logger.log(`Transcription session stopped: ${sessionId}`);
  }

  @SubscribeMessage('get-status')
  handleGetStatus(@ConnectedSocket() client: AuthenticatedSocket) {
    const sessionId = this.clientSessions.get(client.id);
    
    client.emit('status', {
      hasActiveSession: !!sessionId,
      sessionId,
      serverActiveSessions: this.whisperClient.getActiveSessionCount(),
      canStartNew: this.whisperClient.canAcceptSession(),
    });
  }
}
