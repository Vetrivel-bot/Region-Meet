import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Welcome, Superadmin!</h2>
          <p className="text-gray-700">
            Use the navigation on the left to manage users, hosts, and other administrative tasks.
          </p>
        </div>
        {/* Add more dashboard widgets here */}
      </div>
    </div>
  );
};

export default AdminDashboard;
