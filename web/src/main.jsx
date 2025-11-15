import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import UserList from './admin/users/UserList.jsx';
import UserForm from './admin/users/UserForm.jsx';
import HostList from './admin/hosts/HostList.jsx';
import HostForm from './admin/hosts/HostForm.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import ProtectedRoute from './admin/ProtectedRoute.jsx';
import EventLocationList from './admin/eventlocations/EventLocationList.jsx';
import EventLocationForm from './admin/eventlocations/EventLocationForm.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/edit/:id" element={<UserForm />} />
            <Route path="hosts" element={<HostList />} />
            <Route path="hosts/new" element={<HostForm />} />
            <Route path="hosts/edit/:id" element={<HostForm />} />
            <Route path="eventlocations" element={<EventLocationList />} />
            <Route path="eventlocations/new" element={<EventLocationForm />} />
            <Route path="eventlocations/edit/:id" element={<EventLocationForm />} />
          </Route>
        </Route>
        {/* Add other top-level routes here */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
