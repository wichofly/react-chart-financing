import { useEffect, useState } from 'react';
import type { SocketData } from '../models';
import type { Trade } from '../models';

type ConnectionState = 'connecting' | 'open' | 'closed' | 'error';

const isTrade = (value: unknown): value is Trade => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.symbol === 'string' &&
    typeof candidate.price === 'number' &&
    typeof candidate.timestamp === 'number'
  );
};

const extractTrades = (payload: unknown): Trade[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isTrade);
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const data = payload as Record<string, unknown>;

  if (Array.isArray(data.data)) {
    return data.data.filter(isTrade);
  }

  if (Array.isArray(data.trades)) {
    return data.trades.filter(isTrade);
  }

  if (isTrade(data)) {
    return [data];
  }

  return [];
};

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
        const trades = extractTrades(payload);

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
