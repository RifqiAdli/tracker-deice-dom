import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Database } from '../../lib/supabase';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type Device = Database['public']['Tables']['devices']['Row'];

interface MapContainerProps {
  devices: Device[];
  onDeviceClick?: (device: Device) => void;
}

// Custom device marker icons
const createDeviceIcon = (isActive: boolean) => {
  const color = isActive ? '#10B981' : '#6B7280';
  const pulseClass = isActive ? 'animate-pulse' : '';
  
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg ${pulseClass}" 
             style="background-color: ${color};">
          <div class="absolute inset-0 flex items-center justify-center">
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M17 2v2h3a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3V2h2v2h6V2h2zM4 9v10h16V9H4zm2 2h2v2H6v-2zm0 4h2v2H6v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2z"/>
            </svg>
          </div>
        </div>
        ${isActive ? `
          <div class="absolute inset-0 w-8 h-8 rounded-full animate-ping" 
               style="background-color: ${color}; opacity: 0.3;"></div>
        ` : ''}
      </div>
    `,
    className: 'device-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to fit bounds when devices change
function FitBounds({ devices }: { devices: Device[] }) {
  const map = useMap();

  useEffect(() => {
    const validDevices = devices.filter(d => d.last_lat && d.last_lng);
    if (validDevices.length > 0) {
      const bounds = L.latLngBounds(
        validDevices.map(device => [device.last_lat!, device.last_lng!])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [devices, map]);

  return null;
}

export function MapContainer({ devices, onDeviceClick }: MapContainerProps) {
  const defaultCenter: [number, number] = [-6.208763, 106.845172]; // Jakarta coordinates
  const validDevices = devices.filter(d => d.last_lat && d.last_lng);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <LeafletMapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validDevices.map((device) => (
          <Marker
            key={device.id}
            position={[device.last_lat!, device.last_lng!]}
            icon={createDeviceIcon(device.is_active)}
            eventHandlers={{
              click: () => {
                if (onDeviceClick) {
                  onDeviceClick(device);
                }
              },
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-gray-900 mb-1">{device.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{device.device_type}</p>
                <div className="flex items-center mb-2">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    device.is_active ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-xs text-gray-500">
                    {device.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Lat: {device.last_lat?.toFixed(6)}</p>
                  <p>Lng: {device.last_lng?.toFixed(6)}</p>
                  {device.last_seen && (
                    <p>Last seen: {new Date(device.last_seen).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <FitBounds devices={devices} />
      </LeafletMapContainer>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
        <div className="flex flex-col space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Active Device</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600">Inactive Device</span>
          </div>
        </div>
      </div>
      
      {/* Device Counter */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg px-3 py-2">
        <div className="text-sm font-medium text-gray-900">
          {validDevices.length} of {devices.length} devices with location
        </div>
      </div>
    </div>
  );
}