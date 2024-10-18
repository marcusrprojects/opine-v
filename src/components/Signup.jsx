import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // State to track error messages
  const auth = getAuth();

  const handleSignup = (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors before new attempt
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Signed up:", userCredential.user);
      })
      .catch((error) => {
        setError(error.message); // Set error message to display to user
      });
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
      {/* Conditionally render error message */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Signup;