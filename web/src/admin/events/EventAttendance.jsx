import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventAttendance } from '../../services/adminApi';

const EventAttendance = () => {
  const { id } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await getEventAttendance(id);
        setAttendance(data.registrations);
        setEvent(data.event);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [id]);

  if (loading) return <div className="text-center p-4">Loading attendance...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Attendance for {event?.name}</h2>
          <p className="text-gray-600">Total Registrations: {attendance.length}</p>
        </div>
        <Link
          to="/admin/events"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Events
        </Link>
      </div>

      {attendance.length === 0 ? (
        <p>No users have registered for this event yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">User Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Registration Date</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {attendance.map((reg) => (
                <tr key={reg._id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4">{reg.user.fullname}</td>
                  <td className="py-3 px-4">{reg.user.email}</td>
                  <td className="py-3 px-4">{new Date(reg.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        reg.status === 'attended'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}
                    >
                      {reg.status}
                    </span>
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

export default EventAttendance;
