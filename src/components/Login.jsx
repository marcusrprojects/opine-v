import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to hold error message
  const [user, setUser] = useState(null); // State to track the current user
  const auth = getAuth();

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
    <div>
      <h2>{user ? 'Welcome' : 'Login'}</h2>
      {user ? (
        <div>
          <p>Logged in as: {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
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
          <button type="submit">Login</button>
        </form>
      )}

      {/* Display error message if there is one */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;