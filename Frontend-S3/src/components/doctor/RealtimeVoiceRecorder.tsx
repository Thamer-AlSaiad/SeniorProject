import { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface RealtimeVoiceRecorderProps {
  onTranscription: (text: string, isFinal: boolean) => void;
  className?: string;
}

const TRANSCRIPTION_WS_URL = import.meta.env.VITE_API_URL?.replace('/api', '');

export const RealtimeVoiceRecorder = ({
  onTranscription,
  className = '',
}: RealtimeVoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [partialText, setPartialText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sendIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
    }
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    audioChunksRef.current = [];
  }, []);

  // Connect to NestJS transcription gateway
  const connectSocket = useCallback(() => {
    return new Promise<Socket>((resolve, reject) => {
      const token = localStorage.getItem('doctor_token');
      
      const socket = io(`${TRANSCRIPTION_WS_URL}/transcription`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('Connected to transcription service');
        resolve(socket);
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        reject(new Error('Failed to connect to transcription service'));
      });

      socket.on('transcription-result', (data: { type: string; text: string }) => {
        if (data.text) {
          setPartialText(data.text);
          onTranscription(data.text, data.type === 'final');
          if (data.type === 'final') {
            setPartialText('');
          }
        }
      });

      socket.on('transcription-error', (data: { message: string }) => {
        setError(data.message);
        console.error('Transcription error:', data.message);
      });

      socket.on('transcription-started', () => {
        console.log('Transcription session started');
      });

      // Timeout for connection
      setTimeout(() => {
        if (!socket.connected) {
          socket.close();
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    });
  }, [onTranscription]);

  const startRecording = useCallback(async () => {
    setError(null);
    setPartialText('');
    setIsConnecting(true);
    audioChunksRef.current = [];
    
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      streamRef.current = stream;
      
      // Connect to NestJS WebSocket
      const socket = await connectSocket();
      socketRef.current = socket;
      
      // Start transcription session on server
      socket.emit('start-transcription', {});
      
      // Wait for session to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Session start timeout')), 5000);
        
        socket.once('transcription-started', () => {
          clearTimeout(timeout);
          resolve();
        });
        
        socket.once('transcription-error', (data: { message: string }) => {
          clearTimeout(timeout);
          reject(new Error(data.message));
        });
      });
      
      // Start recording
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      // Send accumulated audio every 3 seconds
      sendIntervalRef.current = setInterval(async () => {
        if (audioChunksRef.current.length > 0 && socket.connected) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            socket.emit('audio-chunk', { audio: base64 });
          };
          reader.readAsDataURL(blob);
        }
      }, 3000);
      
      mediaRecorder.start(1000); // Collect chunks every 1s
      setIsRecording(true);
      setIsConnecting(false);
      
    } catch (err: unknown) {
      cleanup();
      socketRef.current?.close();
      socketRef.current = null;
      setIsConnecting(false);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowed')) {
        setError('Microphone access denied');
      } else {
        setError(errorMessage);
      }
      console.error('Recording error:', err);
    }
  }, [connectSocket, cleanup]);

  const stopRecording = useCallback(async () => {
    // Stop media recorder
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    
    // Clear send interval
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
    }
    
    // Send final audio chunk and stop signal
    if (socketRef.current?.connected && audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          socketRef.current?.emit('audio-chunk', { audio: base64 });
          
          // Wait a bit then send stop signal
          setTimeout(() => {
            socketRef.current?.emit('stop-transcription');
            resolve();
          }, 500);
        };
        reader.readAsDataURL(blob);
      });
      
      // Wait for final result then disconnect
      setTimeout(() => {
        socketRef.current?.close();
        socketRef.current = null;
      }, 2000);
    } else {
      socketRef.current?.emit('stop-transcription');
      setTimeout(() => {
        socketRef.current?.close();
        socketRef.current = null;
      }, 1000);
    }
    
    // Stop microphone
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    
    setIsRecording(false);
    audioChunksRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      socketRef.current?.close();
    };
  }, [cleanup]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isConnecting}
        className={`p-2 rounded-full transition-all ${
          isConnecting
            ? 'bg-gray-300 text-gray-500 cursor-wait'
            : isRecording
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
        }`}
        title={isConnecting ? 'Connecting...' : isRecording ? 'Stop' : 'Start recording'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isRecording ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          )}
        </svg>
      </button>
      
      {isConnecting && (
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          Connecting...
        </span>
      )}
      
      {isRecording && (
        <span className="text-sm text-red-500 flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {partialText ? 'Transcribing...' : 'Listening...'}
        </span>
      )}
      
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
