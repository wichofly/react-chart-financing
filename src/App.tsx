import { useMemo } from 'react';
import './App.css';
import { useWebSocket } from './hooks/WebSocketClient';
import TradeChart from './components/TradeChart';

function App() {
  const { messages, connectionState, lastError } = useWebSocket(
    'ws://localhost:8080/ws/trade',
  );

  const trades = useMemo(
    () => messages.flatMap((message) => message.data ?? []),
    [messages],
  );

  return (
    <>
      <div style={{ width: '100%', height: '300px' }}>
        <h1>Finance with React Chart</h1>
        <TradeChart
          trades={trades}
          connectionState={connectionState}
          lastError={lastError}
        />
      </div>
    </>
  );
}

export default App;
