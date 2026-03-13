import { useMemo } from 'react';
import './App.css';
import { useWebSocket } from './hooks/WebSocketClient';

function App() {
  const { messages } = useWebSocket('ws://localhost:8080/ws/trade');

  const trades = useMemo(
    () => messages.flatMap((message) => message.data ?? []),
    [messages],
  );

  return (
    <>
      <div className="content">
        <h1>Finance with React Chart</h1>
        <p>Total trades: {trades.length}</p>
      </div>
    </>
  );
}

export default App;
