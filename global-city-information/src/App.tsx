import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { Toaster } from 'react-hot-toast';

import './App.scss';
import { awsConfig } from './config/aws-config.ts';
import Home from './pages/Home/Home.tsx';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: awsConfig.userPoolWebClientId,
      userPoolId: awsConfig.userPoolId,
    },
  },
});

function App() {
  return (
    <Authenticator className="app" signUpAttributes={['name']}>
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
