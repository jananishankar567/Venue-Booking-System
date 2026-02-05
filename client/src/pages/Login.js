import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const API = process.env.REACT_APP_API_URL;
const GOOGLE_CLIENT_ID =process.env.REACT_APP_API_URL;

function Login({ setToken }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Normal login
  const login = async () => {
    try {
      const res = await axios.post(`${API}/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token); // <--- update App state
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // Google login
  const googleLogin = async (cred) => {
    try {
      const res = await axios.post(`${API}/auth/google`, { id_token: cred.credential });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token); // <--- update App state
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data);
      alert("Google login failed");
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <div className="login-page ">
    <div className="login-card">
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={login}>Login</button>

      <div className="google-login">
        <GoogleLogin
          onSuccess={googleLogin}
          onError={() => alert("Google login failed")}
        />
      </div>

      <p className="register-link" onClick={() => navigate("/register")}>
        Create new account
      </p>
    </div>
  </div>
</GoogleOAuthProvider>
  );
}

export default Login;
