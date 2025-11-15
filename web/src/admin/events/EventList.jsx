import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents, deleteEvent, getAllHosts } from '../../services/adminApi';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [selectedHost, setSelectedHost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedHost) {
        params.host = selectedHost;
      }
      const data = await getAllEvents(params);
      if (Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
        console.error("API did not return an array of events");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHosts = async () => {
    try {
      const hostData = await getAllHosts();
      setHosts(hostData);
    } catch (err) {
      console.error("Failed to fetch hosts:", err);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedHost]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        fetchEvents(); // Refresh the list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleViewRegistrations = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const sortedEvents = React.useMemo(() => {
    let sortableItems = [...(events || [])];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const resolvePath = (path, obj) => path.split('.').reduce((p, c) => (p && p[c]) || null, obj);
        const aValue = resolvePath(sortConfig.key, a);
        const bValue = resolvePath(sortConfig.key, b);
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [events, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
    }
    return '';
  };

  if (loading) return <div className="text-center p-4">Loading events...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Events</h2>
        <Link
          to="/admin/events/new"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Event
        </Link>
      </div>

      <div className="mb-4">
        <label htmlFor="host-filter" className="mr-2">Filter by host:</label>
        <select
          id="host-filter"
          value={selectedHost}
          onChange={(e) => setSelectedHost(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Hosts</option>
          {hosts.map(host => (
            <option key={host._id} value={host._id}>{host.name}</option>
          ))}
        </select>
      </div>

      {sortedEvents.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left cursor-pointer" onClick={() => requestSort('name')}>
                  Event Name{getSortIndicator('name')}
                </th>
                <th className="py-3 px-4 text-left cursor-pointer" onClick={() => requestSort('location.name')}>
                  Location{getSortIndicator('location.name')}
                </th>
                <th className="py-3 px-4 text-left cursor-pointer" onClick={() => requestSort('host.name')}>
                  Host{getSortIndicator('host.name')}
                </th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Registrations</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {sortedEvents.map((event) => (
                <tr key={event._id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4">{event.name}</td>
                  <td className="py-3 px-4">{event.location?.name || 'N/A'}</td>
                  <td className="py-3 px-4">{event.host?.name || 'N/A'}</td>
                  <td className="py-3 px-4">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{event.registrations?.length || 0}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Link
                      to={`/admin/events/edit/${event._id}`}
                      className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleViewRegistrations(event)}
                      className="bg-purple-500 hover:bg-purple-700 text-white text-sm py-1 px-3 rounded"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Registrations for {selectedEvent.name}</h3>
              <div className="mt-2 px-7 py-3">
                <ul className="list-disc list-inside">
                  {selectedEvent.registrations.map(reg => (
                    reg.user && <li key={reg._id}>{reg.user.name} ({reg.user.email})</li>
                  ))}
                </ul>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
