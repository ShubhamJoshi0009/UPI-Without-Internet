export interface Account {
  vpa: string;
  holderName: string;
  balance: number | string;
  version?: number;
}

export interface Transaction {
  id: number;
  packetHash: string;
  senderVpa: string;
  receiverVpa: string;
  amount: number | string;
  signedAt: string;
  settledAt: string;
  bridgeNodeId: string;
  hopCount: number;
  status: 'SETTLED' | 'REJECTED' | 'DUPLICATE_DROPPED' | 'INVALID';
}

export interface VirtualDevice {
  deviceId: string;
  hasInternet: boolean;
  packetCount: number;
  packetIds: string[];
}

export interface MeshState {
  devices: VirtualDevice[];
  idempotencyCacheSize: number;
}

export interface ServerKeyInfo {
  publicKey: string;
  algorithm: string;
  hybridScheme: string;
}

export interface DemoSendRequest {
  senderVpa: string;
  receiverVpa: string;
  amount: number;
  pin: string;
  ttl?: number;
  startDevice?: string;
  tamper?: boolean;
}

export interface DemoSendResponse {
  packetId: string;
  ciphertextPreview: string;
  ttl: number;
  injectedAt: string;
  tampered?: boolean;
}

export interface GossipResult {
  transfers: number;
  deviceCounts: Record<string, number>;
}

export interface BridgeUploadResult {
  bridgeNode: string;
  packetId: string;
  outcome: string;
  reason?: string;
  transactionId?: number;
}

export interface FlushResult {
  uploadsAttempted: number;
  results: BridgeUploadResult[];
}

export interface DuplicateStormResult {
  totalAttempts: number;
  packetId: string;
  settledCount: number;
  duplicateCount: number;
  results: BridgeUploadResult[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'inject' | 'gossip' | 'bridge' | 'settled' | 'duplicate' | 'tamper' | 'reset' | 'info' | 'error';
  title: string;
  detail?: string;
}
