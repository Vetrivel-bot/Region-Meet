import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createHost, getHostById, updateHost, getAllEventLocations } from '../../services/adminApi';

const HostForm = () => {
  const { id } = useParams(); // Get host ID from URL for edit mode
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    type: '',
    locationId: '',
    contact: {
      personName: '',
      role: '',
      email: '',
      phone: '',
    },
    registrationNumber: '',
    taxId: '',
    members: [],
  });
  const [eventLocations, setEventLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch all event locations
        const locations = await getAllEventLocations();
        setEventLocations(locations);

        // If in edit mode, fetch host data
        if (id) {
          const host = await getHostById(id);
          setFormData({
            name: host.name || '',
            legalName: host.legalName || '',
            type: host.type || '',
            locationId: host.locationId?._id || '',
            contact: host.contact || { personName: '', role: '', email: '', phone: '' },
            registrationNumber: host.registrationNumber || '',
            taxId: host.taxId || '',
            members: host.members?.map(member => member._id) || [],
          });
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contact.')) {
      const contactField = name.split('.')[1];
      setFormData((prevData) => ({
        ...prevData,
        contact: {
          ...prevData.contact,
          [contactField]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (id) {
        await updateHost(id, formData);
        setSuccess(true);
        alert('Host updated successfully!');
      } else {
        await createHost(formData);
        setSuccess(true);
        alert('Host created successfully!');
        setFormData({
          name: '',
          legalName: '',
          type: '',
          locationId: '',
          contact: { personName: '', role: '', email: '', phone: '' },
          registrationNumber: '',
          taxId: '',
          members: [],
        });
      }
      navigate('/admin/hosts');
    } catch (err) {
      setError(err.message);
      console.error("Failed to save host:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id && !success) return <div className="text-center p-4">Loading host data...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{id ? 'Edit Host' : 'Add New Host'}</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Host Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Host Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="legalName">
            Legal Name
          </label>
          <input
            type="text"
            id="legalName"
            name="legalName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Legal Name"
            value={formData.legalName}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Type
          </label>
          <input
            type="text"
            id="type"
            name="type"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Type (e.g., college, company)"
            value={formData.type}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="locationId">
            Location
          </label>
          <select
            id="locationId"
            name="locationId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.locationId}
            onChange={handleChange}
            required
          >
            <option value="">Select a Location</option>
            {eventLocations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name} ({loc.city}, {loc.country})
              </option>
            ))}
          </select>
        </div>

        <h3 className="text-xl font-semibold mb-2 mt-6">Contact Information</h3>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact.personName">
            Contact Person Name
          </label>
          <input
            type="text"
            id="contact.personName"
            name="contact.personName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Contact Person Name"
            value={formData.contact.personName}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact.role">
            Contact Person Role
          </label>
          <input
            type="text"
            id="contact.role"
            name="contact.role"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Contact Person Role"
            value={formData.contact.role}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact.email">
            Contact Email
          </label>
          <input
            type="email"
            id="contact.email"
            name="contact.email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Contact Email"
            value={formData.contact.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact.phone">
            Contact Phone
          </label>
          <input
            type="text"
            id="contact.phone"
            name="contact.phone"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Contact Phone"
            value={formData.contact.phone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registrationNumber">
            Registration Number
          </label>
          <input
            type="text"
            id="registrationNumber"
            name="registrationNumber"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Registration Number"
            value={formData.registrationNumber}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="taxId">
            Tax ID
          </label>
          <input
            type="text"
            id="taxId"
            name="taxId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Tax ID"
            value={formData.taxId}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update Host' : 'Add Host')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/hosts')}
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

export default HostForm;