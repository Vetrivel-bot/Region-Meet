import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAllUsers,
  deleteUser,
  getAllEventLocations,
} from "../../services/adminApi";

const UserList = () => {
  const [allUsers, setAllUsers] = useState([]); // Holds the master list
  const [users, setUsers] = useState([]); // Holds the filtered/displayed list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [filterRole, setFilterRole] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "fullname",
    direction: "ascending",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch ALL users and locations ONCE on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [userData, locationData] = await Promise.all([
          getAllUsers(), // Fetches ALL users
          getAllEventLocations(),
        ]);

        setAllUsers(userData); // Set the master list
        setUsers(userData); // Set the initial displayed list
        setLocations(locationData);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Empty array means this runs only once

  // 2. NEW useEffect to handle all FRONT-END filtering/sorting
  useEffect(() => {
    let processedUsers = [...allUsers];

    // --- Apply Filters ---
    if (filterRole) {
      processedUsers = processedUsers.filter(
        (user) => user.role === filterRole
      );
    }

    if (filterLocation) {
      processedUsers = processedUsers.filter(
        (user) => user.host?.location?._id === filterLocation
      );
    }

    // --- Apply Search ---
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      processedUsers = processedUsers.filter(
        (user) =>
          user.fullname.toLowerCase().includes(lowerSearch) ||
          user.email.toLowerCase().includes(lowerSearch)
      );
    }

    // --- Apply Sorting ---
    processedUsers.sort((a, b) => {
      const key = sortConfig.key;
      let aValue;
      let bValue;

      // Handle special case for nested location name
      if (key === "location") {
        aValue = a.host?.location?.name || "";
        bValue = b.host?.location?.name || "";
      } else {
        aValue = a[key];
        bValue = b[key];
      }

      // Case-insensitive string comparison
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === "string") {
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    // --- Update the displayed users ---
    setUsers(processedUsers);
  }, [allUsers, filterRole, filterLocation, searchTerm, sortConfig]); // Re-runs whenever data or filters change

  // 3. Modified handleDelete to update local state
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id); // Still call API to delete from DB

        // --- FRONT-END UPDATE ---
        // Remove the user from the master list.
        // This will trigger the useEffect above to re-filter.
        setAllUsers((prevAllUsers) =>
          prevAllUsers.filter((user) => user._id !== id)
        );
      } catch (err) {
        setError(err.message);
        console.error("Failed to delete user:", err);
      }
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " 🔼" : " 🔽";
    }
    return "";
  };

  if (loading) return <div className="text-center p-4">Loading users...</div>;
  if (error)
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <Link
          to="/admin/users/new"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New User
        </Link>
      </div>

      <div className="flex space-x-4 mb-4">
        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="host">Host</option>
          <option value="supervisor">Supervisor</option>
        </select>

        {/* Location Filter */}
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc._id} value={loc._id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>

      {users.length === 0 ? (
        <p>No users found matching your filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th
                  className="py-3 px-4 text-left cursor-pointer"
                  onClick={() => requestSort("fullname")}
                >
                  Full Name {getSortIndicator("fullname")}
                </th>
                <th className="py-3 px-4 text-left">Email</th>
                <th
                  className="py-3 px-4 text-left cursor-pointer"
                  onClick={() => requestSort("role")}
                >
                  Role {getSortIndicator("role")}
                </th>
                <th
                  className="py-3 px-4 text-left cursor-pointer"
                  onClick={() => requestSort("location")}
                >
                  Location {getSortIndicator("location")}
                </th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-4">{user.fullname}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.role}</td>
                  <td className="py-3 px-4">
                    {user.host?.location?.name || "N/A"}
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Link
                      to={`/admin/users/edit/${user._id}`}
                      className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                    <Link
                      to={`/admin/users/timeline/${user._id}`}
                      className="bg-purple-500 hover:bg-purple-700 text-white text-sm py-1 px-3 rounded"
                    >
                      Timeline
                    </Link>
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

export default UserList;
