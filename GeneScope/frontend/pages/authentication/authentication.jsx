import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from '../../../src/aws-exports';
import './authentication.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

Amplify.configure(awsExports);

export default function Authentication() {
  const navigate = useNavigate(); // Initialize the navigate function



  return (
    <div className="auth-container">
      <Authenticator>
        {({ signOut, user }) => {
          // Redirect to homepage if user is signed in
          if (user) {
            navigate('/'); // Navigate to the homepage
          }

          return (
            <main>
              <h1>Hello {user ? user.username : 'Sign In'}</h1>
              <button onClick={signOut}>Sign out</button>
            </main>
          );
        }}
      </Authenticator>
    </div>

  );
}
