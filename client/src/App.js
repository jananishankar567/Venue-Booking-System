import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import './App.css';
import { useState } from "react";
import MyBookings from "./pages/MyBookings";
import BookingForm from "./pages/BookingForm";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <BrowserRouter>
        <Routes>
  <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<Dashboard setToken={setToken} />} />
  <Route path="/my-bookings" element={<MyBookings />} />
  <Route path="/book/:classroomId" element={<BookingForm />} />
</Routes>

    </BrowserRouter>
  );
}

export default App;
