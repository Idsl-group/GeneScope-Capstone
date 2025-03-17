import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from '../../../src/aws-exports';
import './authentication.css';
import { useNavigate } from 'react-router-dom'; 

Amplify.configure(awsExports);

export default function Authentication() {
  const navigate = useNavigate(); 

  return (
    <div className="auth-container">
      <Authenticator>
        {({ signOut, user }) => {
          if (user) {
            navigate('/'); 
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
