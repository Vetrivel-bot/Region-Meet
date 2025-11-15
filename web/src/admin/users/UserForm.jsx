import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createUser, getUserById, updateUser, getAllHosts } from '../../services/adminApi';

const UserForm = () => {
  const { id } = useParams(); // Get user ID from URL for edit mode
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    role: 'user',
    avatar: '',
    subrole: '',
    host: '',
    isVerified: false,
    expoPushToken: '',
    expoPlatform: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const hostsData = await getAllHosts();
        setHosts(hostsData);

        if (id) {
          const user = await getUserById(id);
          setFormData({
            fullname: user.fullname || '',
            email: user.email || '',
            role: user.role || 'user',
            avatar: user.avatar || '',
            subrole: user.subrole || '',
            host: user.host?._id || '', // Assuming host stores the _id of the host
            isVerified: user.isVerified || false,
            expoPushToken: user.expoPushToken || '',
            expoPlatform: user.expoPlatform || '',
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
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (id) {
        // Update user
        await updateUser(id, formData);
        setSuccess(true);
        alert('User updated successfully!');
      } else {
        // Create new user
        await createUser(formData);
        setSuccess(true);
        alert('User created successfully!');
        setFormData({ // Clear form after successful creation
          fullname: '',
          email: '',
          password: '',
          role: 'user',
          avatar: '',
          subrole: '',
          host: '',
          isVerified: false,
          expoPushToken: '',
          expoPlatform: '',
        });
      }
      navigate('/admin/users'); // Redirect to user list
    } catch (err) {
      setError(err.message);
      console.error("Failed to save user:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id && !success) return <div className="text-center p-4">Loading user data...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{id ? 'Edit User' : 'Add New User'}</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullname">
            Full Name
          </label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password {id && <span className="text-gray-500 text-xs">(Leave blank to keep current)</span>}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={id ? "New Password" : "Password"}
            value={formData.password}
            onChange={handleChange}
            required={!id} // Password is required only for new user creation
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
            <option value="jurry">Jurry</option>
            <option value="organiser">Organiser</option>
            <option value="host">Host</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="host">
            Host
          </label>
          <select
            id="host"
            name="host"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.host}
            onChange={handleChange}
          >
            <option value="">Select a Host</option>
            {hosts.map((host) => (
              <option key={host._id} value={host._id}>
                {host.name}
              </option>
            ))}
          </select>
        </div>
        {/* Add other fields as needed, e.g., avatar, subrole, isVerified */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isVerified">
            Is Verified
          </label>
          <input
            type="checkbox"
            id="isVerified"
            name="isVerified"
            className="mr-2 leading-tight"
            checked={formData.isVerified}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update User' : 'Add User')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
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

export default UserForm;