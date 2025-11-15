import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getUserLocationLog } from '../../services/adminApi';

// Fix for default icon issue with webpack
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const UserTimeline = () => {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await getUserLocationLog(id);
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [id]);

  if (loading) return <div className="text-center p-4">Loading timeline...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (logs.length === 0) return <div className="text-center p-4">No location data found for this user.</div>;

  const positions = logs.map(log => [log.latitude, log.longitude]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">User Location Timeline</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-96">
          <MapContainer center={positions[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Polyline positions={positions} color="blue" />
            {logs.map((log, index) => (
              <Marker key={index} position={[log.latitude, log.longitude]}>
                <Popup>
                  Logged at: {new Date(log.loggedAt).toLocaleString()}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="h-96 overflow-y-auto">
          <h3 className="text-xl font-bold mb-2">Location Points</h3>
          <ul className="divide-y divide-gray-200">
            {logs.map((log, index) => (
              <li key={index} className="py-2">
                <p className="font-semibold">{new Date(log.loggedAt).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Lat: {log.latitude}, Lng: {log.longitude}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserTimeline;
