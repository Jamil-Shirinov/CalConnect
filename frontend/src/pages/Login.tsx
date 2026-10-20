import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Firebase authentication will go here
    console.log(email, password);

    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome,</h1>
        <p>Glad to see you!</p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          Login
        </button>

        <p>Don't have an account?</p>

        <button onClick={() => navigate("/signup")}>
          Sign Up Now
        </button>
      </div>
    </div>
  );
}