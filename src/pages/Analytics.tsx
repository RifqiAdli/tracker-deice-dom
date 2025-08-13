import React, { useEffect, useState } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowTrendingUpIcon // Ganti TrendingUpIcon dengan ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

type Device = Database['public']['Tables']['devices']['Row'];
type DeviceLocation = Database['public']['Tables']['device_locations']['Row'];

export function Analytics() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [locations, setLocations] = useState<DeviceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch devices
      const { data: devicesData, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id);

      if (devicesError) throw devicesError;

      // Fetch recent locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('device_locations')
        .select(`
          *,
          devices!inner(user_id)
        `)
        .eq('devices.user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (locationsError) throw locationsError;

      setDevices(devicesData || []);
      setLocations(locationsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analytics = {
    totalDevices: devices.length,
    activeDevices: devices.filter(d => d.is_active).length,
    totalLocations: locations.length,
    avgAccuracy: locations.length > 0 
      ? locations.reduce((sum, loc) => sum + (loc.accuracy || 0), 0) / locations.length
      : 0,
    deviceUsage: devices.map(device => ({
      name: device.name,
      locations: locations.filter(loc => loc.device_id === device.id).length,
      lastSeen: device.last_seen,
      isActive: device.is_active,
    })),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Device tracking insights and statistics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalDevices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeDevices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPinIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Location Points</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalLocations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.avgAccuracy > 0 ? `${analytics.avgAccuracy.toFixed(1)}m` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Device Usage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Device Activity</h2>
        <div className="space-y-4">
          {analytics.deviceUsage.map((device, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  device.isActive ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <div className={`w-4 h-4 rounded-full ${
                    device.isActive ? 'bg-green-600' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{device.name}</h3>
                  <p className="text-sm text-gray-600">
                    {device.locations} location updates
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  device.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {device.isActive ? 'Active' : 'Inactive'}
                </div>
                {device.lastSeen && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Location Updates</h2>
        {locations.length === 0 ? (
          <div className="text-center py-8">
            <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No location data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {locations.slice(0, 10).map((location) => (
              <div key={location.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Location Update
                    </p>
                    <p className="text-xs text-gray-600">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {formatDistanceToNow(new Date(location.timestamp), { addSuffix: true })}
                  </p>
                  {location.accuracy && (
                    <p className="text-xs text-gray-500">
                      ±{location.accuracy}m accuracy
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}