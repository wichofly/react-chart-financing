import { useEffect, useState } from 'react';
import type { SocketData } from '../models';
import { parseTradesFromSocketPayload } from '../schema/tradeSchema';

type ConnectionState = 'connecting' | 'open' | 'closed' | 'error';

export const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<SocketData[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('connecting');
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setConnectionState('open');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as unknown;
        const trades = parseTradesFromSocketPayload(payload);

        if (trades.length > 0) {
          setMessages((prev) => [...prev, { data: trades }]);
        }
      } catch {
        setLastError('Received invalid JSON from websocket stream.');
      }
    };

    ws.onerror = () => {
      setConnectionState('error');
      setLastError('Could not connect to websocket endpoint.');
      console.error('WebSocket error while connecting to:', url);
    };

    ws.onclose = () => {
      setConnectionState((prev) => (prev === 'error' ? prev : 'closed'));
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { messages, connectionState, lastError };
};
