import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <Link to="/admin" className="block hover:bg-gray-700 p-2 rounded">Dashboard</Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/users" className="block hover:bg-gray-700 p-2 rounded">Manage Users</Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/hosts" className="block hover:bg-gray-700 p-2 rounded">Manage Hosts</Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/eventlocations" className="block hover:bg-gray-700 p-2 rounded">Manage Locations</Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/events" className="block hover:bg-gray-700 p-2 rounded">Manage Events</Link>
            </li>
            {/* Add other admin links here */}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet /> {/* This is where child routes will be rendered */}
      </main>
    </div>
  );
};

export default AdminLayout;
