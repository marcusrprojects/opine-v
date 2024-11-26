import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import "../styles/Authentication.css";

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // State to track error messages
  const auth = getAuth();
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors before new attempt
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Signed up:', userCredential.user);
        navigate('/'); // Redirect to home or another route on successful signup
      })
      .catch((error) => {
        setError(error.message); // Set error message to display to user
        console.error('Error signing up:', error.message);
      });
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up</h2>
      <div className='signup-contents'>
        <form className="signup-form" onSubmit={handleSignup}>
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button className="submit-button" type="submit">
            Sign Up
          </button>

          {/* Conditionally render error message */}
          {error && <p className="error-message">{error}</p>}
        </form>

        <p className="switch-link">
          Already have an account?
          <button
            className="navigate-button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </p>
      
      </div>

    </div>
  );
}

export default Signup;