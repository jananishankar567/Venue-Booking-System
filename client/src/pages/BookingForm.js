import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = process.env.REACT_APP_API_URL+"/api";

function BookingForm() {
  const { classroomId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    staffName: "",
    staffId: "",
    date: "",
    fromtime: "",
    totime: "",
    purpose: "",
    strength: ""
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submitBooking = async () => {
    if (Object.values(form).some(v => !v)) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/book`,
        { classroomId, ...form },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setMessage(res.data.waiting ? "Added to waiting list" : "Booked successfully");
      setSuccess(true);
    } catch (err) {
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-page">
      <div className="booking-card">
        <h2>Book Classroom</h2>

        {!success ? (
          <>
            <input placeholder="Staff Name" onChange={e => setForm({ ...form, staffName: e.target.value })} />
            <input placeholder="Staff ID" onChange={e => setForm({ ...form, staffId: e.target.value })} />
            <input type="date" onChange={e => setForm({ ...form, date: e.target.value })} />
            <input type="time" onChange={e => setForm({ ...form, fromtime: e.target.value })} />
            <input type="time" onChange={e => setForm({ ...form, totime: e.target.value })} />
            <input placeholder="Purpose" onChange={e => setForm({ ...form, purpose: e.target.value })} />
            <input type="number" placeholder="Strength" onChange={e => setForm({ ...form, strength: e.target.value })} />

            <button onClick={submitBooking} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </>
        ) : (
          <>
            <p>{message}</p>
            <button onClick={() => navigate("/dashboard")}>Back</button>
          </>
        )}
      </div>
    </div>
  );
}

export default BookingForm;
