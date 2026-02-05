import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:4000";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    mobile: "",
    address: "",
    agree: false
  });

  const register = async () => {
    if (!form.agree) {
      alert("You must agree to Terms & Conditions");
      return;
    }

    await axios.post(`${API}/register`, form);
    alert("Registered successfully!");
    navigate("/");
  };

  return (
  <div className="register-page">
    <div className="register-card">
      <h2>Create New Account</h2>

      <input
  placeholder="First Name"
  onChange={e => setForm({ ...form, firstName: e.target.value })}
/>

<input
  placeholder="Last Name"
  onChange={e => setForm({ ...form, lastName: e.target.value })}
/>


      <input
        placeholder="Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <input
        type="date"
        onChange={e => setForm({ ...form, dob: e.target.value })}
      />

      <select onChange={e => setForm({ ...form, gender: e.target.value })}>
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
      </select>

      <input
        placeholder="Mobile No"
        onChange={e => setForm({ ...form, mobile: e.target.value })}
      />

      <input
        placeholder="Address"
        onChange={e => setForm({ ...form, address: e.target.value })}
      />

      <label className="terms">
  <input
    type="checkbox"
    onChange={e => setForm({ ...form, agree: e.target.checked })}
  />
  <span>I agree to Terms & Conditions</span>
</label>


      <button onClick={register}>Register</button>

      <p className="login-link" onClick={() => navigate("/")}>
        Already have an account? Login
      </p>
    </div>
  </div>
);
}

export default Register;
