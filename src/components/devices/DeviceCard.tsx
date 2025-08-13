import React from 'react';
import { Database } from '../../lib/supabase';
import { 
  SignalIcon, 
  BatteryIcon, 
  MapPinIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

type Device = Database['public']['Tables']['devices']['Row'];

interface DeviceCardProps {
  device: Device;
  onViewLocation: (device: Device) => void;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
}

export function DeviceCard({ device, onViewLocation, onEdit, onDelete }: DeviceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            device.is_active ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <div className={`w-6 h-6 rounded-full ${
              device.is_active ? 'bg-green-600' : 'bg-gray-400'
            }`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{device.name}</h3>
            <p className="text-sm text-gray-600">{device.device_type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            device.is_active ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <span className={`text-xs font-medium ${
            device.is_active ? 'text-green-600' : 'text-gray-500'
          }`}>
            {device.is_active ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {device.last_lat && device.last_lng ? (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4" />
            <span>
              {device.last_lat.toFixed(6)}, {device.last_lng.toFixed(6)}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <MapPinIcon className="w-4 h-4" />
            <span>No location data</span>
          </div>
        )}

        {device.last_seen && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>
              Last seen {formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <SignalIcon className="w-4 h-4" />
          <span>Signal: {device.is_active ? 'Strong' : 'No Signal'}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onViewLocation(device)}
          disabled={!device.last_lat || !device.last_lng}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View on Map
        </button>
        <button
          onClick={() => onEdit(device)}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(device)}
          className="px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}