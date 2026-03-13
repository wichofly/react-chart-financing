import { Chart, type AxisOptions } from 'react-charts';
import type { Trade } from '../models';

type TradeChartProps = {
  trades: Trade[];
  connectionState: 'connecting' | 'open' | 'closed' | 'error';
  lastError: string | null;
};

type Datum = {
  date: Date;
  price: number;
};

const TradeChart = ({
  trades,
  connectionState,
  lastError,
}: TradeChartProps) => {
  const colorMap: { [key: string]: string } = {
    BTC_USDT: '#eb6f92',
    ETH_USDT: '#9ccfd8',
    XRP_USDT: '#c4a7e7',
    ADA_USDT: '#f6c177',
    DODGE_USDT: '#31748f',
  };

  const uniqueSymbols = Array.from(
    new Set(trades.map((trade) => trade.symbol)),
  );

  const data = uniqueSymbols.map((symbol) => ({
    label: symbol,
    data: trades
      .filter((trade) => trade.symbol === symbol)
      .map((trade) => ({
        date: new Date(trade.timestamp),
        price: trade.price,
        color: colorMap[symbol] || '#000000', // Default to black if symbol not in colorMap
      })),
  }));

  const primaryAxis: AxisOptions<Datum> = {
    getValue: (datum: Datum) => datum.date,
    scaleType: 'time',
  };

  const secondaryAxes: AxisOptions<Datum>[] = [
    {
      getValue: (datum: Datum) => datum.price,
      scaleType: 'linear',
      elementType: 'line',
    },
  ];

  if (data.length === 0) {
    if (connectionState === 'connecting') {
      return <div>Connecting to trade stream...</div>;
    }

    if (connectionState === 'error') {
      return (
        <div>
          No trade data available. {lastError ?? 'WebSocket connection failed.'}
        </div>
      );
    }

    if (connectionState === 'closed') {
      return <div>No trade data available. WebSocket connection closed.</div>;
    }

    return <div>No trade data available yet.</div>;
  }

  return (
    <div>
      <Chart
        options={{
          data,
          primaryAxis,
          secondaryAxes,
          getSeriesStyle: (series) => ({
            color: series.originalSeries.data[0].color,
          }),
        }}
      />
    </div>
  );
};

export default TradeChart;
