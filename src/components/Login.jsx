import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import "../styles/Authentication.css";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to hold error message
  const [user, setUser] = useState(null); // State to track the current user
  const auth = getAuth();
  const navigate = useNavigate();

  // Track the authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; // Clean up the listener on unmount
  }, [auth]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError(''); // Clear previous error before attempting login
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Logged in:', userCredential.user);
      })
      .catch((error) => {
        setError(error.message); // Set the error message in state
        console.error('Error logging in:', error.message);
      });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">{user ? 'Welcome' : 'User Account'}</h2>
      {user ? (
        <div className="user-info">
          <p className="user-email">Logged in as: {user.email}</p>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className='login-contents'>
          <form className="login-form" onSubmit={handleLogin}>
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
              Login
            </button>
          </form>
          

          <p className="switch-link">
            Don&apos;t have an account?
            <button
              className="navigate-button"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </p>
        </div>
      )}

      {/* Display error message if there is one */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Login;