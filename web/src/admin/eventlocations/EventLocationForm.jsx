import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createEventLocation, getEventLocationById, updateEventLocation } from '../../services/adminApi';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Make sure to import Leaflet CSS

// Fix for default marker icon issue with Webpack/Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapClickHandler = ({ onMapClick, markerPosition }) => {
  const map = useMap(); // Get map instance

  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lng, e.latlng.lat]); // Store as [longitude, latitude]
    },
  });

  // Recenter map when markerPosition changes (e.g., when loading an existing location)
  useEffect(() => {
    if (markerPosition && (markerPosition[0] !== 0 || markerPosition[1] !== 0)) {
      map.setView([markerPosition[1], markerPosition[0]], map.getZoom());
    }
  }, [markerPosition, map]);

  return markerPosition && (markerPosition[0] !== 0 || markerPosition[1] !== 0) ? (
    <Marker position={[markerPosition[1], markerPosition[0]]} />
  ) : null;
};

const EventLocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    city: '',
    state: '',
    country: 'India',
    range: 50,
    location: {
      coordinates: [0, 0], // [longitude, latitude]
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchLocation = async () => {
        try {
          setLoading(true);
          const location = await getEventLocationById(id);
          setFormData({
            name: location.name || '',
            address: location.address || { line1: '', line2: '', city: '', state: '', postalCode: '', country: '' },
            city: location.city || '',
            state: location.state || '',
            country: location.country || 'India',
            range: location.range || 50,
            location: {
              coordinates: location.location?.coordinates || [0, 0],
            },
          });
        } catch (err) {
          setError(err.message);
          console.error("Failed to fetch event location for edit:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchLocation();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleMapClick = useCallback((coords) => {
    setFormData((prevData) => ({
      ...prevData,
      location: {
        ...prevData.location,
        coordinates: coords,
      },
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (id) {
        await updateEventLocation(id, formData);
        setSuccess(true);
        alert('Event location updated successfully!');
      } else {
        await createEventLocation(formData);
        setSuccess(true);
        alert('Event location created successfully!');
        setFormData({
          name: '',
          address: { line1: '', line2: '', city: '', state: '', postalCode: '', country: '' },
          city: '',
          state: '',
          country: 'India',
          range: 50,
          location: { coordinates: [0, 0] },
        });
      }
      navigate('/admin/eventlocations');
    } catch (err) {
      setError(err.message);
      console.error("Failed to save event location:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id && !success) return <div className="text-center p-4">Loading event location data...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  const initialMapCenter = formData.location.coordinates[0] !== 0 || formData.location.coordinates[1] !== 0
    ? [formData.location.coordinates[1], formData.location.coordinates[0]] // Leaflet expects [latitude, longitude]
    : [20.5937, 78.9629]; // Default to India center

  const initialZoom = (formData.location.coordinates[0] !== 0 || formData.location.coordinates[1] !== 0) ? 13 : 5; // Zoom in if coordinates exist

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{id ? 'Edit Event Location' : 'Add New Event Location'}</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Location Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Location Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <h3 className="text-xl font-semibold mb-2 mt-6">Address</h3>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.line1">
            Address Line 1
          </label>
          <input
            type="text"
            id="address.line1"
            name="address.line1"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Address Line 1"
            value={formData.address.line1}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.line2">
            Address Line 2
          </label>
          <input
            type="text"
            id="address.line2"
            name="address.line2"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Address Line 2"
            value={formData.address.line2}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.city">
            Address City
          </label>
          <input
            type="text"
            id="address.city"
            name="address.city"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Address City"
            value={formData.address.city}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.state">
            Address State
          </label>
          <input
            type="text"
            id="address.state"
            name="address.state"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Address State"
            value={formData.address.state}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.postalCode">
            Postal Code
          </label>
          <input
            type="text"
            id="address.postalCode"
            name="address.postalCode"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Postal Code"
            value={formData.address.postalCode}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.country">
            Address Country
          </label>
          <input
            type="text"
            id="address.country"
            name="address.country"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Address Country"
            value={formData.address.country}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="state">
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="range">
            Range (in meters)
          </label>
          <input
            type="number"
            id="range"
            name="range"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Range"
            value={formData.range}
            onChange={handleChange}
            required
          />
        </div>

        <h3 className="text-xl font-semibold mb-2 mt-6">Select Location on Map</h3>
        <div className="mb-4">
          <p className="text-gray-700 text-sm mb-2">
            Click on the map to set the location. The marker will show the selected point.
            Current Coordinates: Longitude: {formData.location.coordinates[0]}, Latitude: {formData.location.coordinates[1]}
          </p>
          <MapContainer
            center={initialMapCenter}
            zoom={initialZoom}
            scrollWheelZoom={true}
            style={{ height: '400px', width: '100%' }}
            key={initialMapCenter.toString()} // Key to force remount when center changes
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} markerPosition={formData.location.coordinates} />
          </MapContainer>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update Location' : 'Add Location')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/eventlocations')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventLocationForm;
