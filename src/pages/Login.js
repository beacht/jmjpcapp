import React, { useState } from "react";
import { useAuth } from "../AuthContext";

const Login = () => {
  const { login } = useAuth(); // Get login function from context
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (phone) {
      login(phone); // Call login function to save phone number
    } else {
      setError("Please enter a phone number");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter your phone number"
      />
      <button onClick={handleLogin}>Log In</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
