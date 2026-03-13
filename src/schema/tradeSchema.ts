import { z } from 'zod';
import type { Trade } from '../models';

const tradeSchema = z.object({
  symbol: z.string().min(1),
  price: z.coerce.number(),
  timestamp: z.coerce.number(),
});

const tradeArraySchema = z.array(tradeSchema);
const socketDataSchema = z.object({ data: tradeArraySchema });
const socketTradesSchema = z.object({ trades: tradeArraySchema });

export const parseTradesFromSocketPayload = (payload: unknown): Trade[] => {
  const asTradeArray = tradeArraySchema.safeParse(payload);
  if (asTradeArray.success) {
    return asTradeArray.data;
  }

  const asSocketData = socketDataSchema.safeParse(payload);
  if (asSocketData.success) {
    return asSocketData.data.data;
  }

  const asSocketTrades = socketTradesSchema.safeParse(payload);
  if (asSocketTrades.success) {
    return asSocketTrades.data.trades;
  }

  const asSingleTrade = tradeSchema.safeParse(payload);
  if (asSingleTrade.success) {
    return [asSingleTrade.data];
  }

  return [];
};
