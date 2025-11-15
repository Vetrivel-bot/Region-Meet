import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllEventLocations, deleteEventLocation } from '../../services/adminApi';

const EventLocationList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await getAllEventLocations();
      setLocations(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch event locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event location?')) {
      try {
        await deleteEventLocation(id);
        fetchLocations(); // Refresh the list
      } catch (err) {
        setError(err.message);
        console.error("Failed to delete event location:", err);
      }
    }
  };

  if (loading) return <div className="text-center p-4">Loading event locations...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Event Locations</h2>
        <Link
          to="/admin/eventlocations/new"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Location
        </Link>
      </div>

      {locations.length === 0 ? (
        <p>No event locations found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">City</th>
                <th className="py-3 px-4 text-left">State</th>
                <th className="py-3 px-4 text-left">Country</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {locations.map((location) => (
                <tr key={location._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-4">{location.name}</td>
                  <td className="py-3 px-4">{location.city}</td>
                  <td className="py-3 px-4">{location.state}</td>
                  <td className="py-3 px-4">{location.country}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Link
                      to={`/admin/eventlocations/edit/${location._id}`}
                      className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(location._id)}
                      className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventLocationList;
