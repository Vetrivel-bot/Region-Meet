import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllHosts, deleteHost } from '../../services/adminApi';

const HostList = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchHosts = async () => {
    try {
      setLoading(true);
      const data = await getAllHosts();
      setHosts(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch hosts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this host?')) {
      try {
        await deleteHost(id);
        fetchHosts(); // Refresh the list
      } catch (err) {
        setError(err.message);
        console.error("Failed to delete host:", err);
      }
    }
  };

  if (loading) return <div className="text-center p-4">Loading hosts...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Hosts</h2>
        <Link
          to="/admin/hosts/new"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Host
        </Link>
      </div>

      {hosts.length === 0 ? (
        <p>No hosts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Location ID</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {hosts.map((host) => (
                <tr key={host._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-4">{host.name}</td>
                  <td className="py-3 px-4">{host.type}</td>
                  <td className="py-3 px-4">{host.locationId?.name || host.locationId}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Link
                      to={`/admin/hosts/edit/${host._id}`}
                      className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(host._id)}
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

export default HostList;