import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { Toaster } from 'react-hot-toast';

import './App.scss';
import { awsConfig } from './config/aws-config.ts';
import Home from './pages/home/Home.tsx';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: awsConfig.userPoolId,
      userPoolClientId: awsConfig.userPoolWebClientId,
      loginWith: {
        oauth: {
          domain: awsConfig.oauthDomain,
          scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
          redirectSignIn: [awsConfig.redirectSignIn],
          redirectSignOut: [awsConfig.redirectSignOut],
          responseType: 'code',
        },
      },
    },
  },
});

function App() {
  return (
    <Authenticator className="app" signUpAttributes={['name']} socialProviders={['google']}>
      {() => (
        <main>
          <header className="App-header">
            <Toaster position="top-right" reverseOrder={false} />
            <Home />
          </header>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
