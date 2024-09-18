import { Button } from '@mui/material';
import { signOut } from 'aws-amplify/auth';
import toast from 'react-hot-toast';

import './Home.scss';
import Weather from './Weather/Weather.tsx';

const Home = () => {
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('You have successfully signed out!');
      console.log('User signed out');
    } catch (error) {
      toast.error('Failed to sign out. Please try again!');
      console.log('Error signing out', error);
    }
  };

  return (
    <div className="home">
      <div className="home__content">
        <div className="home__button">
          <Button variant="contained" color="error" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
        <Weather />
      </div>
    </div>
  );
};

export default Home;
