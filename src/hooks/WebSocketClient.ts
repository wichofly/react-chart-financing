import { useEffect, useState } from 'react';
import type { SocketData } from '../models';

export const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<SocketData[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as SocketData;

      setMessages((prev) => [...prev, data]); // Append the new message to the existing messages
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { messages };
};
