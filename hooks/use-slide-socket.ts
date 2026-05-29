'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface GenerationStatus {
  jobId: string;
  status: 'queued' | 'generating' | 'processing' | 'complete' | 'error';
  message: string;
  progress?: number;
  deckId?: string;
  error?: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export function useSlideSocket(
  jobId: string | null,
  onStatus: (status: GenerationStatus) => void,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const socket = io(`${SOCKET_URL}/ai`, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // joined namespace
    });

    socket.on(`job:${jobId}`, (status: GenerationStatus) => {
      onStatus(status);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [jobId, onStatus]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  return { disconnect };
}
