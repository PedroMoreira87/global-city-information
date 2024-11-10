import { useAuthenticator } from '@aws-amplify/ui-react';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { signOut } from 'aws-amplify/auth';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { getUser } from '../../apis/aws-lambda-functions.ts';
import { User } from '../../interfaces/user.interface.ts';
import './Home.scss';
import Weather from './weather/Weather.tsx';

const Home = () => {
  const { user } = useAuthenticator();
  const [userData, setUserData] = useState<User | null>(null);

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.userId) {
        try {
          const userData = await getUser(user.userId);
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleUserDataUpdate = (updatedUserData: User) => {
    setUserData(updatedUserData);
  };

  const lastFiveWeather = useMemo(() => {
    const weatherData = userData?.weather || [];
    return [...weatherData]
      .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())
      .slice(-5);
  }, [userData?.weather]);

  return (
    <div className="home">
      <div className="home__content">
        <div className="home__button">
          <Button variant="contained" color="error" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
        <h1 className="home__greetings">Hello {userData?.name}!</h1>
        {lastFiveWeather.length > 0 && (
          <TableContainer
            sx={{
              marginLeft: 'auto',
              marginRight: 'auto',
              width: 'calc(100% - 10rem)',
            }}
            component={Paper}
          >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>City</TableCell>
                  <TableCell align="right">State</TableCell>
                  <TableCell align="right">Country&nbsp;</TableCell>
                  <TableCell align="right">Temperature&nbsp;</TableCell>
                  <TableCell align="right">FeelsLike&nbsp;</TableCell>
                  <TableCell align="right">Description&nbsp;</TableCell>
                  <TableCell align="right">Humidity&nbsp;</TableCell>
                  <TableCell align="right">Latitude&nbsp;</TableCell>
                  <TableCell align="right">Longitude&nbsp;</TableCell>
                  <TableCell align="right">Created At&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lastFiveWeather?.map((row, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {row.place.city}
                    </TableCell>
                    <TableCell align="right">{row.place.state}</TableCell>
                    <TableCell align="right">{row.place.country}</TableCell>
                    <TableCell align="right">{row.temperature}°C</TableCell>
                    <TableCell align="right">{row.feelsLike}°C</TableCell>
                    <TableCell align="right">{row.description}</TableCell>
                    <TableCell align="right">{row.humidity}%</TableCell>
                    <TableCell align="right">{row.latitude}</TableCell>
                    <TableCell align="right">{row.longitude}</TableCell>
                    <TableCell align="right">{new Date(row.created_at!).toISOString().split('T')[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Weather onUserDataUpdate={handleUserDataUpdate} />
      </div>
    </div>
  );
};

export default Home;
