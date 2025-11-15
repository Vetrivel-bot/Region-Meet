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
import EventList from './admin/events/EventList.jsx';
import EventForm from './admin/events/EventForm.jsx';
import EventAttendance from './admin/events/EventAttendance.jsx';
import UserTimeline from './admin/users/UserTimeline.jsx';

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
            <Route path="users/timeline/:id" element={<UserTimeline />} />
            <Route path="hosts" element={<HostList />} />
            <Route path="hosts/new" element={<HostForm />} />
            <Route path="hosts/edit/:id" element={<HostForm />} />
            <Route path="eventlocations" element={<EventLocationList />} />
            <Route path="eventlocations/new" element={<EventLocationForm />} />
            <Route path="eventlocations/edit/:id" element={<EventLocationForm />} />
            <Route path="events" element={<EventList />} />
            <Route path="events/new" element={<EventForm />} />
            <Route path="events/edit/:id" element={<EventForm />} />
            <Route path="events/attendance/:id" element={<EventAttendance />} />
          </Route>
        </Route>
        {/* Add other top-level routes here */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
