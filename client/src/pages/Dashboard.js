
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const API = "http://localhost:4000/api";

// function Dashboard({ setToken }) {
//   const navigate = useNavigate();
//   const [rooms, setRooms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState(""); // New state for search

//   const userName = "Janani"; // Replace with actual user name from token if available (e.g., decode JWT for name)

//   useEffect(() => {
//     loadRooms();
//     const interval = setInterval(() => {
//       loadRooms();  // Auto-refresh every 5 minutes
//     }, 300000);
//     return () => clearInterval(interval);
//   },[]);

//   const loadRooms = async () => {
//     setLoading(true);
//     const token = localStorage.getItem("token");

//     if (!token) {
//       alert("No token found. Please log in again.");
//       navigate("/");
//       return;
//     }

//     try {
//       const roomsRes = await axios.get(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } });
//       let roomsData = roomsRes.data;

//       // Update statuses based on user's bookings
//       const bookingsRes = await axios.get(`${API}/my-bookings`, { headers: { Authorization: `Bearer ${token}` } });
//       const userBookings = bookingsRes.data;

//       roomsData = roomsData.map(room => {
//         const userBooking = userBookings.find(b => b.classroomId === room._id);
//         if (userBooking) {
//           if (userBooking.status === "CONFIRMED") {
//             return { ...room, status: "Not Available" };
//           } else if (userBooking.status === "WAITING") {
//             return { ...room, status: "Waiting List" };
//           }
//         }
//         return room; // Keep default status from /api/classrooms if no user booking
//       });

//       setRooms(roomsData);
//     } catch (err) {
//       alert("Failed to load classrooms: " + (err.response?.data?.message || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter rooms based on search term
//   const filteredRooms = rooms.filter(room =>
//     room.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const bookRoom = (id) => {
//     navigate(`/book/${id}`);
//   };

//   const cancelRoom = async (id) => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       alert("No token found. Please log in again.");
//       navigate("/");
//       return;
//     }

//     try {
//       const bookingsRes = await axios.get(`${API}/my-bookings`, { headers: { Authorization: `Bearer ${token}` } });
//       const userBooking = bookingsRes.data.find(b => b.classroomId === id && b.status === "CONFIRMED");
//       if (!userBooking) {
//         alert("No active booking found for this room.");
//         return;
//       }

//       const bookingId = userBooking._id;

//       const userConfirmed = window.confirm("Are you sure you want to cancel this booking?");
//       if (!userConfirmed) return;

//       await axios.delete(`${API}/cancel/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
//       alert("Booking cancelled");
//       loadRooms();
//     } catch (err) {
//       alert("Failed to cancel booking: " + (err.response?.data?.message || err.message));
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setToken(null);
//     navigate("/");
//   };
  
//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-header">
//         <h2>Welcome, {userName} 👋</h2>
//         <button className="logout-btn" onClick={logout}>Logout</button>
//       </div>
//       <p className="subtitle">You are logged in successfully!!! Book classrooms!!!</p>
//       <button className="my-bookings-btn" onClick={() => navigate("/my-bookings")}>View My Bookings</button>
//       <br></br>
//       {/* New Search Input */}
//       <input
//         type="text"
//         placeholder="Search classrooms by name..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         style={{ margin: "10px 0", padding: "8px", width: "50%" }}
//       />

//       {loading ? <p>Loading...</p> : (
//         <div className="table-container">
//           <table className="room-table">
//             <thead>
//               <tr>
//                 <th>Classroom Name</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredRooms.length === 0 ? (
//                 <tr>
//                   <td colSpan="3">No classrooms available</td>
//                 </tr>
//               ) : (
//                 filteredRooms.map(room => (
//                   <tr key={room._id}>
//                     <td>{room.name || "No Name"}</td>
//                     <td className={`status-${room.status.toLowerCase().replace(" ", "-")}`}>{room.status}</td>
//                     <td>
//                       {room.status === "Available" && (
//                         <button onClick={() => bookRoom(room._id)} className="btn btn-success">Book Now</button>
//                       )}
//                       {room.status === "Not Available" && (
//                         <button className="cancel-btn btn-warning" onClick={() => cancelRoom(room._id)}>Cancel Booking</button>
//                       )}
//                       {room.status === "Waiting List" && <span>In Queue</span>}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Dashboard;
import axios from "axios";
import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL +"/api";
function Dashboard({ setToken }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search

  const userName = "Janani"; // Replace with actual user name from token if available (e.g., decode JWT for name)

  // Memoize loadRooms with useCallback to include dependencies
  const loadRooms = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No token found. Please log in again.");
      navigate("/");
      return;
    }

    try {
      const roomsRes = await axios.get(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } });
      let roomsData = roomsRes.data;

      // Update statuses based on user's bookings
      const bookingsRes = await axios.get(`${API}/my-bookings`, { headers: { Authorization: `Bearer ${token}` } });
      const userBookings = bookingsRes.data;

      roomsData = roomsData.map(room => {
        const userBooking = userBookings.find(b => b.classroomId === room._id);
        if (userBooking) {
          if (userBooking.status === "CONFIRMED") {
            return { ...room, status: "Not Available" };
          } else if (userBooking.status === "WAITING") {
            return { ...room, status: "Waiting List" };
          }
        }
        return room; // Keep default status from /api/classrooms if no user booking
      });

      setRooms(roomsData);
    } catch (err) {
      alert("Failed to load classrooms: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [navigate]); // Dependencies for loadRooms

  useEffect(() => {
    loadRooms();
    const interval = setInterval(() => {
      loadRooms();  // Auto-refresh every 5 minutes
    }, 300000);
    return () => clearInterval(interval);
  }, [loadRooms]); // Now includes loadRooms

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bookRoom = (id) => {
    navigate(`/book/${id}`);
  };

  const cancelRoom = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    try {
      const bookingsRes = await axios.get(`${API}/my-bookings`, { headers: { Authorization: `Bearer ${token}` } });
      const userBooking = bookingsRes.data.find(b => b.classroomId === id && b.status === "CONFIRMED");
      if (!userBooking) {
        alert("No active booking found for this room.");
        return;
      }

      const bookingId = userBooking._id;

      const userConfirmed = window.confirm("Are you sure you want to cancel this booking?");
      if (!userConfirmed) return;

      await axios.delete(`${API}/cancel/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("Booking cancelled");
      loadRooms();
    } catch (err) {
      alert("Failed to cancel booking: " + (err.response?.data?.message || err.message));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {userName} 👋</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
      <p className="subtitle">You are logged in successfully!!! Book classrooms!!!</p>
      <button className="my-bookings-btn" onClick={() => navigate("/my-bookings")}>View My Bookings</button>
      <br></br>
      {/* New Search Input */}
      <input
        type="text"
        placeholder="Search classrooms by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ margin: "10px 0", padding: "8px", width: "50%" }}
      />

      {loading ? <p>Loading...</p> : (
        <div className="table-container">
          <table className="room-table">
            <thead>
              <tr>
                <th>Classroom Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="3">No classrooms available</td>
                </tr>
              ) : (
                filteredRooms.map(room => (
                  <tr key={room._id}>
                    <td>{room.name || "No Name"}</td>
                    <td className={`status-${room.status.toLowerCase().replace(" ", "-")}`}>{room.status}</td>
                    <td>
                      {room.status === "Available" && (
                        <button onClick={() => bookRoom(room._id)} className="btn btn-success">Book Now</button>
                      )}
                      {room.status === "Not Available" && (
                        <button className="cancel-btn btn-warning" onClick={() => cancelRoom(room._id)}>Cancel Booking</button>
                      )}
                      {room.status === "Waiting List" && <span>In Queue</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;