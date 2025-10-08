import { storage } from "../storage";
import type { BrokerEnv, BrokerProvider, BrokerProviderName, BrokerStatus } from "./types";
import { createIbkrProvider } from "./ibkr";
import type { InsertTrade } from "@shared/schema";

type BrokerBundle = {
  status: BrokerStatus;
  api: BrokerProvider;
};

// Adapter over existing in-memory storage for the mock provider.
function createMockProvider(): BrokerProvider {
  return {
    getAccount: () => storage.getAccountInfo(),
    getPositions: () => storage.getPositions(),
    getOptionChain: (symbol: string, expiration?: string) => storage.getOptionChain(symbol, expiration),
    getTrades: () => storage.getTrades(),
    placeOrder: async (trade: InsertTrade) => {
      // For mock, placement is handled by routes today; return a simple ack.
      return { status: "accepted_mock" };
    },
  };
}

export function getBroker(): BrokerBundle {
  const provider = (process.env.BROKER_PROVIDER as BrokerProviderName) || "mock";
  const env = (process.env.IBKR_ENV as BrokerEnv) || "paper";

  if (provider === "ibkr") {
    const accountId = process.env.IBKR_ACCOUNT_ID;
    const baseUrl = process.env.IBKR_BASE_URL;

    const api = createIbkrProvider({ env, accountId, baseUrl });
    const status: BrokerStatus = { provider, env, connected: false };
    return { status, api };
  }

  const api = createMockProvider();
  const status: BrokerStatus = { provider: "mock", env: "paper", connected: true };
  return { status, api };
}

