import type {
  Account,
  Transaction,
  MeshState,
  ServerKeyInfo,
  DemoSendRequest,
  DemoSendResponse,
  GossipResult,
  FlushResult,
  DuplicateStormResult,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getServerKey(): Promise<ServerKeyInfo> {
    return request<ServerKeyInfo>('/api/server-key');
  },

  getAccounts(): Promise<Account[]> {
    return request<Account[]>('/api/accounts');
  },

  getTransactions(): Promise<Transaction[]> {
    return request<Transaction[]>('/api/transactions');
  },

  getMeshState(): Promise<MeshState> {
    return request<MeshState>('/api/mesh/state');
  },

  sendDemoPacket(payload: DemoSendRequest): Promise<DemoSendResponse> {
    return request<DemoSendResponse>('/api/demo/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  runGossip(): Promise<GossipResult> {
    return request<GossipResult>('/api/mesh/gossip', {
      method: 'POST',
    });
  },

  flushBridges(): Promise<FlushResult> {
    return request<FlushResult>('/api/mesh/flush', {
      method: 'POST',
    });
  },

  resetMesh(): Promise<{ status: string }> {
    return request<{ status: string }>('/api/mesh/reset', {
      method: 'POST',
    });
  },

  runDuplicateStorm(count = 3): Promise<DuplicateStormResult> {
    return request<DuplicateStormResult>('/api/demo/duplicate-storm', {
      method: 'POST',
      body: JSON.stringify({ count }),
    });
  },

  directIngest(packet: any, bridgeNodeId: string, hopCount: number): Promise<any> {
    return request<any>('/api/bridge/ingest', {
      method: 'POST',
      headers: {
        'X-Bridge-Node-Id': bridgeNodeId,
        'X-Hop-Count': String(hopCount),
      },
      body: JSON.stringify(packet),
    });
  },
};
