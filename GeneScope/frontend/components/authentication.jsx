import React, { useState } from 'react';
import { Auth } from 'aws-amplify'; // Correct AWS Amplify import

export default function Authentication({ onAuthSuccess }) {
  const [authState, setAuthState] = useState('signin'); // Manage sign-in or sign-up state
  const [formState, setFormState] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSignIn = async () => {
    try {
      await Auth.signIn(formState.username, formState.password); // Use Auth.signIn
      onAuthSuccess(); // Notify parent (App) of successful login
    } catch (err) {
      setError('Error signing in: ' + err.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await Auth.signUp({
        username: formState.username,
        password: formState.password,
        attributes: { email: formState.email }, // Required attributes for sign up
      });
      setAuthState('signin'); // Switch to sign-in state after successful sign-up
    } catch (err) {
      setError('Error signing up: ' + err.message);
    }
  };

  return (
    <div>
      <h2>{authState === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        name="username"
        onChange={handleChange}
        placeholder="Username"
        value={formState.username}
      />
      {authState === 'signup' && (
        <input
          name="email"
          onChange={handleChange}
          placeholder="Email"
          value={formState.email}
        />
      )}
      <input
        name="password"
        type="password"
        onChange={handleChange}
        placeholder="Password"
        value={formState.password}
      />
      {authState === 'signin' ? (
        <button onClick={handleSignIn}>Sign In</button>
      ) : (
        <button onClick={handleSignUp}>Sign Up</button>
      )}
      <p>
        {authState === 'signin' ? (
          <>
            Don't have an account?{' '}
            <span onClick={() => setAuthState('signup')} style={{ color: 'blue', cursor: 'pointer' }}>
              Sign Up
            </span>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <span onClick={() => setAuthState('signin')} style={{ color: 'blue', cursor: 'pointer' }}>
              Sign In
            </span>
          </>
        )}
      </p>
    </div>
  );
}
