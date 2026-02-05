import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL+"/api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await axios.get(`${API}/my-bookings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setBookings(res.data);
    } catch (err) {
      alert("Failed to load bookings: " + (err.response?.data?.message || err.message));
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await axios.delete(`${API}/cancel/${bookingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Booking cancelled");
      loadBookings(); // Reload bookings after cancel
    } catch (err) {
      alert("Failed to cancel booking: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="bookings-page">
      <div className="bookings-header container">
        <span className="back-arrow" onClick={() => navigate("/dashboard")}>←</span>
        <h2>My Booked Classrooms</h2>
      </div>

      <table className="bookings-table container">
        <thead>
          <tr>
            <th>Classroom</th>
            <th>Date</th>
            <th>Time</th>
            <th>Strength</th>  {/* New column for Strength */}
            <th>Purpose</th>   {/* New column for Purpose */}
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map(b => (
            <tr key={b._id}>
              <td>{b.classroomName}</td>
              <td>{new Date(b.date).toLocaleDateString()}</td>
              <td>{b.fromtime} - {b.totime}</td>
              <td>{b.strength}</td>  {/* Display Strength */}
              <td>{b.purpose}</td>   {/* Display Purpose */}
              <td>{b.status}</td>
              <td>
                <button className="btn btn-warning" onClick={() => cancelBooking(b._id)}>Cancel</button>
                {b.status === "WAITING" && (
                  <button onClick={() => navigate("/dashboard")}>Book Another</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyBookings;