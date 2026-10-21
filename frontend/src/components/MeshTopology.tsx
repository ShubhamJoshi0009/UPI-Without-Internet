import React, { useState } from 'react';
import {
  Smartphone,
  Globe,
  Bluetooth,
  PackageCheck,
  Layers,
  Info,
  RadioTower,
  WifiOff,
  Signal,
  Binary,
} from 'lucide-react';
import type { VirtualDevice } from '../types';

interface MeshTopologyProps {
  devices: VirtualDevice[];
  onSelectDevice?: (deviceId: string) => void;
}

export const MeshTopology: React.FC<MeshTopologyProps> = ({ devices }) => {
  const [selectedDevice, setSelectedDevice] = useState<VirtualDevice | null>(null);

  const totalHeldPackets = devices.reduce((sum, d) => sum + d.packetCount, 0);

  return (
    <div className="glass-card">
      <div className="card-header">
        <h3 className="card-title">
          <Layers size={18} color="#a855f7" />
          Virtual BLE Mesh Topology
        </h3>
        <span className="card-subtitle" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Bluetooth size={12} color="#38bdf8" />
          {devices.length} Nodes &bull;
          <PackageCheck size={12} color="#34d399" />
          {totalHeldPackets} Replicas in Air
        </span>
      </div>

      <div className="devices-grid">
        {devices.map((device) => {
          const isBridge = device.hasInternet;
          const hasPackets = device.packetCount > 0;

          return (
            <div
              key={device.deviceId}
              className={`device-card ${isBridge ? 'bridge' : ''} ${
                hasPackets ? 'has-packets active-pulse' : ''
              }`}
              onClick={() => setSelectedDevice(device)}
              title="Click to view detailed device node packets"
            >
              <div className="device-header">
                <div className="device-title">
                  {isBridge ? (
                    <RadioTower size={16} color="#34d399" />
                  ) : (
                    <Smartphone size={16} color="#94a3b8" />
                  )}
                  <span>{device.deviceId}</span>
                </div>
                <span
                  className={`device-badge ${
                    isBridge ? 'bridge-badge' : 'offline-badge'
                  }`}
                >
                  {isBridge ? (
                    <>
                      <Globe size={11} />
                      <Signal size={10} /> 4G LTE
                    </>
                  ) : (
                    <>
                      <Bluetooth size={11} />
                      <WifiOff size={10} /> BLE Mesh
                    </>
                  )}
                </span>
              </div>

              <div className="device-stats">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <PackageCheck size={12} /> Held Packets:
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: hasPackets ? '#38bdf8' : 'var(--text-dim)',
                  }}
                >
                  {device.packetCount}
                </span>
              </div>

              <div className="packet-pill-list">
                {device.packetIds.length > 0 ? (
                  device.packetIds.map((id, idx) => (
                    <span key={idx} className="packet-pill" title={`Mesh Packet ID: ${id}`}>
                      <Binary size={10} />
                      {id}
                    </span>
                  ))
                ) : (
                  <span className="no-packets">Buffer empty</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDevice && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '10px',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Info size={16} color="#38bdf8" />
            <span>
              Device: <strong>{selectedDevice.deviceId}</strong> &bull;{' '}
              {selectedDevice.hasInternet ? (
                <span style={{ color: '#34d399' }}>
                  Bridge Node (walked outside, has 4G connection to POST packets to /api/bridge/ingest)
                </span>
              ) : (
                <span style={{ color: '#94a3b8' }}>
                  Offline Node in basement (BLE store-and-forward relay peer)
                </span>
              )}
            </span>
          </div>
          <button
            className="chip-btn"
            onClick={() => setSelectedDevice(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
