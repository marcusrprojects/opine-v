import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');  // State to hold error message
  const auth = getAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');  // Clear previous error before attempting login
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Logged in:', userCredential.user);
      })
      .catch((error) => {
        setError(error.message);  // Set the error message in state
        console.error('Error logging in:', error.message);
      });
  };

  return (
    <div>
      <h2>Login</h2>
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
      
      {/* Display error message if there is one */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;